import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { debounce } from "lodash";
import useTestStore from "../../store/testStore";
import { db } from "../../firebase/index";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const QuestionForm = () => {
  const { testMeta, resetTest, questionFormData, setQuestionFormData } =
    useTestStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: questionFormData || {
      questions: Array.from({ length: testMeta?.totalQuestions || 1 }, () => ({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      })),
    },
  });

  const watchedFields = watch();
  useEffect(() => {
    const debounced = debounce(() => {
      setQuestionFormData(watchedFields);
    }, 500);

    debounced();

    return () => debounced.cancel();
  }, [watchedFields, setQuestionFormData]);

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data) => {
    try {
      const formattedQuestions = data.questions.map((q, i) => {
        const answer = parseInt(q.correctAnswer);
        if (isNaN(answer) || answer < 1 || answer > 4) {
          throw new Error(
            `Question ${i + 1}: Correct answer must be a number between 1 and 4`
          );
        }

        return {
          ...q,
          correctAnswer: answer - 1,
        };
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
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="px-4 pt-6 lg:pt-10 lg:px-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add Questions for {testMeta?.subjectName}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 p-4 border rounded-lg bg-white shadow"
          >
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Question {index + 1}
              </label>
              <input
                type="text"
                {...register(`questions.${index}.question`)}
                className="w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter the question"
              />
            </div>

            {[0, 1, 2, 3].map((optIdx) => (
              <div key={optIdx}>
                <label className="block mb-1 font-medium text-gray-600">
                  Option {optIdx + 1}
                </label>
                <input
                  type="text"
                  {...register(`questions.${index}.options.${optIdx}`)}
                  className="w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder={`Option ${optIdx + 1}`}
                />
              </div>
            ))}

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Correct Answer (Option Number: 1–4)
              </label>
              <input
                type="number"
                min={1}
                max={4}
                {...register(`questions.${index}.correctAnswer`)}
                className="w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Eg: 1"
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-semibold"
        >
          Submit Test
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
