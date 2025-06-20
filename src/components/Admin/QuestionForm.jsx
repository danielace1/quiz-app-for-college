import Proptypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import useTestStore from "../../store/testStore";
import { db } from "../../firebase/index";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const QuestionForm = ({ onBack }) => {
  const [isHydrated, setIsHydrated] = useState(false);
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

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

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

  if (!isHydrated) return null;

  return (
    <div className="px-2 pt-6 lg:pt-10 lg:px-8 max-w-4xl mx-auto">
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
        {fields.map((field, index) => {
          const question = watch(`questions.${index}`);

          return (
            <div
              key={field.id}
              className="space-y-4 p-4 border rounded-lg bg-white shadow"
            >
              <label className="block mb-1 font-medium text-gray-700">
                # Question {index + 1}
              </label>
              <select
                {...register(`questions.${index}.type`)}
                className="outline-none py-1 px-1.5 rounded-md border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="mcq">MCQ</option>
                <option value="fitb">Fill in the Blank</option>
              </select>
              <input
                type="text"
                {...register(`questions.${index}.question`)}
                onBlur={(e) =>
                  setValue(
                    `questions.${index}.question`,
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
                            `questions.${index}.options`,
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
                        {...register(`questions.${index}.options.${optIdx}`)}
                        onBlur={(e) =>
                          setValue(
                            `questions.${index}.options.${optIdx}`,
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
                          {...register(`questions.${index}.correctAnswers`)}
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
                    {...register(`questions.${index}.blankAnswer`)}
                    onBlur={(e) =>
                      setValue(
                        `questions.${index}.blankAnswer`,
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

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-semibold"
          >
            Submit Test
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
