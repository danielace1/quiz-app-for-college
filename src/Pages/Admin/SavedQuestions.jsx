import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { Save, Trash2, FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";

const parseQuizText = (text) => {
  const quiz = [];
  const questionRegex =
    /\*\*Q\d+:\s*(.*?)\*\*[\s\S]*?A\)\s*(.*?)B\)\s*(.*?)C\)\s*(.*?)D\)\s*(.*?)\*\*Answer:\s*(.*?)$/gm;

  let match;
  while ((match = questionRegex.exec(text))) {
    const question = match[1].trim();
    const options = [match[2], match[3], match[4], match[5]].map((o) =>
      o.trim()
    );
    const answer = match[6].replace(/^[A-D]\)\s*/, "").trim();
    quiz.push({ question, options, answer });
  }

  return quiz;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const SavedQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedQuestions = async () => {
      try {
        const q = query(
          collection(db, "savedQuestions"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const saved = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(saved);
      } catch (err) {
        console.error("Error fetching saved questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedQuestions();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this saved quiz?"
    );
    if (!confirmDelete) return;

    try {
      setDeleting(id);
      await deleteDoc(doc(db, "savedQuestions", id));
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <Save className="w-7 h-7 text-blue-500" />
          Saved Questions
        </h1>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center mt-16 animate-pulse">
          Fetching saved quizzes...
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 space-y-5">
          <FileQuestion className="w-24 h-24 text-blue-300 opacity-60" />
          <p className="text-lg font-medium">No saved questions yet</p>
          <p className="text-sm text-gray-500">
            You haven’t saved any quizzes yet. Try generating one now!
          </p>
          <button
            onClick={() => navigate("/admin/generate-questions")}
            className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
          >
            ➕ Generate Questions
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-5 pb-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
          {questions.map((q) => {
            const parsed = parseQuizText(q.message);

            return (
              <div
                key={q.id}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 relative hover:shadow-md transition-all duration-300"
              >
                <div className="absolute top-4 right-5 text-gray-400 text-xs">
                  {formatTimestamp(q.createdAt)}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deleting === q.id}
                  className={`absolute top-10 right-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    deleting === q.id
                      ? "bg-red-200 text-red-600 cursor-wait"
                      : "bg-red-50 hover:bg-red-100 text-red-600"
                  }`}
                >
                  <Trash2 size={14} />
                  {deleting === q.id ? "Deleting..." : "Delete"}
                </button>

                {/* Quiz Content */}
                {parsed.length > 0 ? (
                  parsed.map((item, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                      {/* Question */}
                      <div className="flex items-start gap-2 mb-3">
                        <span className="font-bold text-blue-600">
                          Q{idx + 1}.
                        </span>
                        <div className="font-semibold text-gray-900 text-base leading-snug">
                          <ReactMarkdown
                            components={{
                              p: ({ node, children }) => (
                                <span className="leading-snug">{children}</span>
                              ),
                            }}
                          >
                            {item.question}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid sm:grid-cols-2 gap-2 ml-6">
                        {item.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                              opt === item.answer
                                ? "bg-green-50 border-green-400 text-green-800 shadow-sm"
                                : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            <span className="font-bold">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <ReactMarkdown
                              components={{
                                p: ({ node, children }) => (
                                  <span>{children}</span>
                                ),
                              }}
                            >
                              {opt}
                            </ReactMarkdown>
                          </div>
                        ))}
                      </div>

                      {/* Correct Answer Tag */}
                      <div className="mt-3 ml-6">
                        <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          ✅ Correct Answer: {item.answer}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-800 whitespace-pre-line">
                    <ReactMarkdown
                      components={{
                        p: ({ node, children }) => <span>{children}</span>,
                      }}
                    >
                      {q.message}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedQuestions;
