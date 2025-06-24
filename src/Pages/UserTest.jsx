import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  query,
  where,
  getDocs as getQueryDocs,
} from "firebase/firestore";
import useTestStore from "../store/testStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Replace this with actual user ID from auth
const userId = "student123";

const QUESTIONS_PER_PAGE = 10;

const UserTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    testMeta,
    answers,
    currentPage,
    timeLeft,
    setTestMeta,
    updateAnswer,
    setCurrentPage,
    setTimeLeft,
    resetTest,
  } = useTestStore();

  // Check if already submitted by querying Firestore
  useEffect(() => {
    const checkSubmission = async () => {
      const q = query(
        collection(db, "results"),
        where("testId", "==", testId),
        where("userId", "==", userId)
      );
      const snap = await getQueryDocs(q);
      if (!snap.empty) {
        alert("You have already submitted this test.");
        return navigate("/already-submitted");
      }
    };
    checkSubmission();
  }, [testId, navigate]);

  // Fetch test and questions
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const testRef = doc(db, "tests", testId);
        const testSnap = await getDoc(testRef);
        if (!testSnap.exists()) return navigate("/not-found");

        const data = testSnap.data();
        setTestMeta(data);

        const qSnap = await getDocs(collection(testRef, "questions"));
        const qList = qSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(qList);

        // Set timer after all async done
        setTimeLeft(data.durationMinutes * 60);
        setLoading(false);
      } catch (err) {
        console.error("Error loading test:", err);
        navigate("/error");
      }
    };
    fetchTest();
  }, [testId, navigate, setTestMeta, setTimeLeft]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || isNaN(timeLeft)) return;
    if (timeLeft <= 0) return handleSubmit();
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Submit on tab switch
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden) {
        alert("Tab switch detected. Submitting test.");
        handleSubmit();
      }
    };
    document.addEventListener("visibilitychange", handleTabSwitch);
    return () =>
      document.removeEventListener("visibilitychange", handleTabSwitch);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const timestamp = new Date().toISOString();
    await setDoc(doc(db, "results", `${testId}_${userId}`), {
      testId,
      userId,
      timestamp,
      answers,
    });

    resetTest();

    navigate(`/test/${testId}/result`, {
      state: { meta: testMeta, questions, answers },
    });
  }, [answers, navigate, questions, resetTest, testId, testMeta]);

  if (loading || !testMeta || timeLeft === null || isNaN(timeLeft))
    return <p className="text-center py-10">Loading...</p>;

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIdx = currentPage * QUESTIONS_PER_PAGE;
  const currentQs = questions.slice(startIdx, startIdx + QUESTIONS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-gray-800 select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-2 sticky top-0 z-20 bg-inherit">
        <h1 className="text-xl font-bold">
          {testMeta.subjectName} ({testMeta.subjectCode})
        </h1>
        <span className="font-mono text-lg bg-black text-white px-3 py-1 rounded">
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentQs.map((q, idx) => {
          const isMultiple = q.correctAnswers?.length > 1;
          const selected = answers[q.id] || [];

          return (
            <div
              key={q.id}
              className="bg-white p-5 border shadow rounded no-copy"
            >
              <p className="mb-3 font-semibold">
                Q{startIdx + idx + 1}. {q.question}
              </p>
              {q.type === "mcq" ? (
                q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className="flex items-center gap-3 mb-2 cursor-pointer rounded-md border px-3 py-2 transition hover:bg-gray-50"
                  >
                    <input
                      type={isMultiple ? "checkbox" : "radio"}
                      name={q.id}
                      checked={selected.includes(optIdx)}
                      onChange={() =>
                        updateAnswer(
                          q.id,
                          isMultiple
                            ? selected.includes(optIdx)
                              ? selected.filter((i) => i !== optIdx)
                              : [...selected, optIdx]
                            : [optIdx]
                        )
                      }
                    />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))
              ) : (
                <input
                  type="text"
                  value={selected[0] || ""}
                  onChange={(e) => updateAnswer(q.id, [e.target.value])}
                  placeholder="Your answer..."
                  className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          <ChevronLeft size={20} /> Prev
        </button>

        <div className="text-sm text-gray-600">
          Page {currentPage + 1} of {totalPages}
        </div>

        {currentPage === totalPages - 1 ? (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Submit Test
          </button>
        ) : (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserTest;
