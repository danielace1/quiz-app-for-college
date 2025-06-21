import Proptypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import useTestStore from "../../store/testStore";
import { db } from "../../firebase/index";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import PreviewQuestions from "../../Pages/Admin/PreviewQuestions";

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const QUESTIONS_PER_PAGE = 5;

const QuestionForm = ({ onBack }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { testMeta, resetTest, questionFormData, setQuestionFormData } =
    useTestStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: questionFormData || {
      questions: Array.from({ length: testMeta?.totalQuestions || 1 }, () => ({
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        blankAnswer: "",
      })),
    },
  });

  const totalPages = Math.ceil(
    (testMeta?.totalQuestions || 1) / QUESTIONS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (questionFormData && !isHydrated) {
      reset(questionFormData);
    }
    setIsHydrated(true);
  }, [reset, questionFormData, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !testMeta?.totalQuestions) return;

    const currentLength = questionFormData?.questions?.length || 0;
    if (currentLength === testMeta.totalQuestions) return;

    const updatedQuestions = Array.from(
      { length: testMeta.totalQuestions },
      (_, i) => {
        return (
          questionFormData?.questions?.[i] || {
            type: "mcq",
            question: "",
            options: ["", "", "", ""],
            correctAnswers: [],
            blankAnswer: "",
          }
        );
      }
    );

    const updatedFormData = { questions: updatedQuestions };

    reset(updatedFormData);
    setQuestionFormData(updatedFormData);
  }, [
    testMeta?.totalQuestions,
    isHydrated,
    reset,
    setQuestionFormData,
    questionFormData?.questions,
  ]);

  useEffect(() => {
    const subscription = watch((value) => {
      setQuestionFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, setQuestionFormData]);

  const handleClear = () => {
    const clearedData = {
      questions: Array.from({ length: testMeta?.totalQuestions || 1 }, () => ({
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        blankAnswer: "",
      })),
    };
    reset(clearedData);
    setQuestionFormData(clearedData);
  };

  const onSubmit = async (data) => {
    try {
      const formattedQuestions = data.questions.map((q, i) => {
        if (q.type === "mcq") {
          if (!q.correctAnswers || q.correctAnswers.length === 0) {
            throw new Error(
              `# Question ${
                i + 1
              }: At least one correct answer must be selected.`
            );
          }
          return {
            ...q,
            correctAnswers: q.correctAnswers.map(Number),
          };
        } else if (q.type === "fitb") {
          if (!q.blankAnswer.trim()) {
            throw new Error(
              `# Question ${i + 1}: Fill in the blank answer required.`
            );
          }
          return {
            ...q,
          };
        }
      });

      const testRef = await addDoc(collection(db, "tests"), {
        ...testMeta,
        createdAt: serverTimestamp(),
      });

      const questionsRef = collection(testRef, "questions");
      await Promise.all(formattedQuestions.map((q) => addDoc(questionsRef, q)));

      alert("Test & Questions created successfully!");
      resetTest();
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  if (isPreviewing) {
    return (
      <PreviewQuestions
        questions={watch("questions")}
        onBack={() => setIsPreviewing(false)}
        onConfirm={handleSubmit(onSubmit)}
      />
    );
  }

  if (!isHydrated) return null;

  return (
    <div className="px-2 pt-6 py-3 lg:pt-10 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-4 -ml-2">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add Questions for {testMeta?.subjectName}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {fields.slice(startIndex, endIndex).map((field, index) => {
          const globalIndex = startIndex + index;
          const question = watch(`questions.${globalIndex}`);

          return (
            <div
              key={field.id}
              className="space-y-4 p-4 border rounded-lg bg-white shadow"
            >
              <label className="block mb-1 font-medium text-gray-700">
                # Question {globalIndex + 1}
              </label>
              <select
                {...register(`questions.${globalIndex}.type`)}
                className="outline-none py-1 px-1.5 rounded-md border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="mcq">MCQ</option>
                <option value="fitb">Fill in the Blank</option>
              </select>
              <input
                type="text"
                {...register(`questions.${globalIndex}.question`)}
                onBlur={(e) =>
                  setValue(
                    `questions.${globalIndex}.question`,
                    capitalizeFirst(e.target.value)
                  )
                }
                className="w-full outline-none px-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter the question"
              />

              {question?.type === "mcq" && (
                <>
                  <div className="flex gap-2 mb-2">
                    {[3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() =>
                          setValue(
                            `questions.${globalIndex}.options`,
                            Array.from(
                              { length: count },
                              (_, i) => question.options?.[i] || ""
                            )
                          )
                        }
                        className={`px-3 py-1 text-sm border rounded-full transition ${
                          question?.options?.length === count
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        {count} Options
                      </button>
                    ))}
                  </div>

                  {question?.options?.map((_, optIdx) => (
                    <div key={optIdx}>
                      <label className="block text-sm mb-2">
                        Option {optIdx + 1}
                      </label>
                      <input
                        type="text"
                        {...register(
                          `questions.${globalIndex}.options.${optIdx}`
                        )}
                        onBlur={(e) =>
                          setValue(
                            `questions.${globalIndex}.options.${optIdx}`,
                            capitalizeFirst(e.target.value)
                          )
                        }
                        className="w-full outline-none px-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block font-medium mb-2">
                      Select Correct Option(s)
                    </label>
                    {question?.options?.map((_, optIdx) => (
                      <label
                        key={optIdx}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          {...register(
                            `questions.${globalIndex}.correctAnswers`
                          )}
                          value={optIdx}
                          className="cursor-pointer"
                        />
                        <span>Option {optIdx + 1}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {question?.type === "fitb" && (
                <div>
                  <label className="block text-sm mb-2">Correct Answer</label>
                  <input
                    type="text"
                    {...register(`questions.${globalIndex}.blankAnswer`)}
                    onBlur={(e) =>
                      setValue(
                        `questions.${globalIndex}.blankAnswer`,
                        capitalizeFirst(e.target.value)
                      )
                    }
                    className="w-full outline-none px-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-md text-sm font-semibold transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm font-medium text-gray-700 text-center">
            Page <span className="text-blue-600">{currentPage}</span> of{" "}
            <span className="text-blue-600">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-md text-sm font-semibold transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 space-y-1">
          <p>
            Total Questions:{" "}
            <span className="font-medium">{testMeta?.totalQuestions || 1}</span>
          </p>
          <p>
            Questions per Page:{" "}
            <span className="font-medium">{QUESTIONS_PER_PAGE}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-2 border border-red-600 text-red-600 rounded-md font-medium hover:bg-red-50 transition text-sm"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewing(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 transition text-white rounded-md font-semibold text-sm"
          >
            Preview Test
          </button>
        </div>
      </form>
    </div>
  );
};

QuestionForm.propTypes = {
  onBack: Proptypes.func,
};

export default QuestionForm;
