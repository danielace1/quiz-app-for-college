import PropTypes from "prop-types";

const PreviewQuestions = ({ questions, onBack, onConfirm }) => {
  return (
    <div className="px-4 pt-6 pb-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Preview Your Questions
      </h2>
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg shadow bg-white space-y-2"
          >
            <p className="font-medium text-gray-900">
              Q{i + 1}. {q.question}
            </p>

            {q.type === "mcq" && (
              <ul className="list-disc ml-6">
                {q.options?.map((opt, idx) => (
                  <li
                    key={idx}
                    className={
                      q.correctAnswers?.includes(idx.toString()) ||
                      q.correctAnswers?.includes(idx)
                        ? "font-semibold text-green-500"
                        : ""
                    }
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}

            {q.type === "fitb" && (
              <p className="text-blue-700">
                Answer: <span className="font-semibold">{q.blankAnswer}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 border border-gray-600 text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Edit
        </button>
        <button
          onClick={onConfirm}
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
};

PreviewQuestions.propTypes = {
  questions: PropTypes.array,
  onBack: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default PreviewQuestions;
