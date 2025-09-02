import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { testMeta, questions, answers } = state || {};

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!state) {
      navigate("/me/test");
    }
  }, [state, navigate]);

  if (!state) return null;

  const normalize = (val) => {
    const strArray = Array.isArray(val) ? val : [val];
    return strArray
      .flatMap((v) =>
        String(v)
          .toLowerCase()
          .replace(/[.,]/g, "")
          .split(/[\s,]+/)
          .map((word) => word.trim())
          .filter(Boolean)
      )
      .sort();
  };

  const getCorrectCount = () => {
    return questions.reduce((score, q) => {
      const correct =
        q.type === "fitb" ? [q.blankAnswer ?? ""] : q.correctAnswers || [];

      const selected =
        q.type === "fitb" ? [answers[q.id]?.[0] || ""] : answers[q.id] || [];

      const normalizedCorrect = normalize(correct);
      const normalizedSelected = normalize(selected);

      const correctSet = new Set(normalizedCorrect);
      const selectedSet = new Set(normalizedSelected);

      const isCorrect =
        correctSet.size === selectedSet.size &&
        [...correctSet].every((item) => selectedSet.has(item));

      return score + (isCorrect ? 1 : 0);
    }, 0);
  };

  const correctCount = getCorrectCount();
  const totalQuestions = questions.length;

  return (
    <div className="max-w-4xl mx-auto p-2 text-gray-800">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          🎉 Test Completed!
        </h1>
        <p className="text-lg text-gray-600">
          <span className="font-semibold">{testMeta.subjectName}</span> (
          {testMeta.subjectCode})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white text-center mb-10">
        <div className="bg-blue-600 p-5 rounded-lg shadow-md">
          <p className="text-sm">Correct Answers</p>
          <p className="text-2xl font-bold">{correctCount}</p>
        </div>
        <div className="bg-yellow-600 p-5 rounded-lg shadow-md">
          <p className="text-sm">Total Questions</p>
          <p className="text-2xl font-bold">{totalQuestions}</p>
        </div>
        <div className="bg-green-600 p-5 rounded-lg shadow-md">
          <p className="text-sm">Score</p>
          <p className="text-2xl font-bold">
            {correctCount} / {totalQuestions}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = answers[q.id] || [];
          const correct = q.correctAnswers || [];

          return (
            <div
              key={q.id}
              className="bg-white p-5 border rounded-lg shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Q{idx + 1}. {q.question}
              </h3>
              {q.type === "mcq" ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const isSelected = selected.includes(i);
                    const isCorrect = correct.includes(i);

                    let bg = "border-gray-300";
                    if (isCorrect && isSelected) {
                      bg = "bg-green-100 border-green-600";
                    } else if (isCorrect) {
                      bg = "bg-green-50 border-green-400";
                    } else if (isSelected) {
                      bg = "bg-red-50 border-red-400";
                    }

                    return (
                      <div
                        key={i}
                        className={`border px-3 py-2 rounded-md ${bg}`}
                      >
                        <span className="text-sm">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="border border-gray-300 px-3 py-2 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold text-gray-700">
                        Your Answer:
                      </span>{" "}
                      {selected?.[0]?.trim() ? (
                        selected[0]
                      ) : (
                        <em className="text-red-500">No answer</em>
                      )}
                    </p>
                  </div>

                  <div className="border border-green-400 px-3 py-2 rounded-md bg-green-50">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Correct Answer:</span>{" "}
                      {correct.length > 0
                        ? correct.join(", ")
                        : q.blankAnswer?.trim() || (
                            <em className="text-red-500">Not provided</em>
                          )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <Link to="/me/test" className="block text-center mt-8">
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md shadow transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Tests
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Result;
