import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import Countdown from "react-countdown";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import useTestStore from "../store/testStore";
import Loader from "../components/Loader";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

const QUESTIONS_PER_PAGE = 5;

export default function UserTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const initialized = useRef(false);
  const submitted = useRef(false);
  const submittedViaTabSwitch = useRef(false);

  const {
    testMeta,
    questions,
    answers,
    currentPage,
    startTime,
    endTime,
    setTestMeta,
    setQuestions,
    updateAnswer,
    setCurrentPage,
    setStartTime,
    setEndTime,
    resetTest,
    hasHydrated,
  } = useTestStore();

  const handleSubmit = useCallback(async () => {
    if (!userId || submitted.current) return;

    submitted.current = true;

    const now = Date.now();
    const timeTakenInSeconds = startTime
      ? Math.floor((now - startTime) / 1000)
      : null;

    await setDoc(doc(db, "results", `${testId}_${userId}`), {
      testId,
      userId,
      timestamp: new Date().toISOString(),
      timeTaken: timeTakenInSeconds,
      answers,
    });

    if (!submittedViaTabSwitch.current) {
      alert("Test submitted successfully!");
    }

    resetTest();
    setEndTime(null);
    navigate(`/me/test/${testId}/result`, {
      state: { testMeta, questions, answers },
      replace: true,
    });
  }, [
    userId,
    testId,
    answers,
    resetTest,
    navigate,
    testMeta,
    questions,
    setEndTime,
    startTime,
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        alert("Please login to continue.");
        return navigate("/login");
      }

      const uid = user.uid;
      const resultDoc = await getDoc(doc(db, "results", `${testId}_${uid}`));
      if (resultDoc.exists()) {
        alert("You’ve already attended this test.");
        return navigate("/me/test");
      }

      setUserId(uid);
    });

    return unsubscribe;
  }, [navigate, testId]);

  useEffect(() => {
    if (!hasHydrated || !userId || !testId || initialized.current) return;

    (async () => {
      try {
        const testRef = doc(db, "tests", testId);
        const snap = await getDoc(testRef);

        if (!snap.exists()) {
          alert("Test not found");
          return navigate("/tests");
        }

        const data = snap.data();
        setTestMeta(data);

        const qSnap = await getDocs(collection(testRef, "questions"));
        setQuestions(qSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const durationMs = data.durationMinutes * 60 * 1000;
        const now = Date.now();

        if (endTime === null || isNaN(endTime) || endTime < now) {
          const computedEndTime = now + durationMs;
          setEndTime(computedEndTime);
          setStartTime(now);
        }

        initialized.current = true;
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/error");
      }
    })();
  }, [
    userId,
    testId,
    endTime,
    setEndTime,
    setTestMeta,
    navigate,
    hasHydrated,
    setQuestions,
    setStartTime,
  ]);

  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden && !submitted.current) {
        submittedViaTabSwitch.current = true;
        alert("You switched tabs. The test has been submitted.");
        handleSubmit();
      }
    };

    document.addEventListener("visibilitychange", handleTabSwitch);
    return () => {
      document.removeEventListener("visibilitychange", handleTabSwitch);
    };
  }, [handleSubmit]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "v", "a", "s", "p", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  if (!hasHydrated || loading || !testMeta || typeof endTime !== "number") {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const sliceStart = currentPage * QUESTIONS_PER_PAGE;
  const pageQs = questions.slice(sliceStart, sliceStart + QUESTIONS_PER_PAGE);

  return (
    <div
      className="max-w-5xl mx-auto text-gray-800 select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="py-2 sm:py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1">
          {testMeta.subjectName}
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          {testMeta.subjectCode}
        </p>
      </div>

      <div className="sticky top-0 z-30 bg-transparent backdrop-blur-sm py-2 mb-4">
        <div className="flex justify-between items-center px-3 py-2 sm:px-4 rounded-md border border-gray-200">
          {endTime && (
            <div className="flex items-center gap-2 py-1">
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                Time Left:
              </span>
              <Countdown
                date={endTime}
                onComplete={handleCountdownComplete}
                renderer={({ minutes, seconds }) => (
                  <div className="font-mono text-xs sm:text-base bg-black text-white px-3 py-0.5 rounded-full shadow animate-pulse tracking-wide min-w-[65px] text-center">
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </div>
                )}
              />
            </div>
          )}

          <button
            title="Leave Test"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to leave the test? All progress will be lost."
                )
              ) {
                resetTest();
                setEndTime(null);
                navigate("/me/test");
              }
            }}
            className="flex items-center gap-2 text-sm sm:text-base font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-3 py-1.5 rounded-md transition duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden xs:inline">Leave Test</span>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-7">
        {pageQs.map((q, idx) => {
          const selected = answers[q.id] || [];
          const isMultiple = q.correctAnswers?.length > 1;

          return (
            <div
              key={q.id}
              className="bg-white border rounded-lg shadow-sm p-5 transition hover:shadow-md"
            >
              <p className="text-lg sm:text-xl font-semibold mb-4 leading-relaxed">
                <span className="text-blue-600 font-bold">
                  Q{sliceStart + idx + 1}.
                </span>{" "}
                {q.question}
              </p>

              {q.type === "mcq" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 border px-2.5 py-2 rounded-lg cursor-pointer transition hover:bg-gray-50 ${
                        selected.includes(i)
                          ? "bg-blue-50 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type={isMultiple ? "checkbox" : "radio"}
                        name={q.id}
                        checked={selected.includes(i)}
                        onChange={() =>
                          updateAnswer(
                            q.id,
                            isMultiple
                              ? selected.includes(i)
                                ? selected.filter((x) => x !== i)
                                : [...selected, i]
                              : [i]
                          )
                        }
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="text-base">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={selected[0] || ""}
                  onChange={(e) => updateAnswer(q.id, [e.target.value])}
                  placeholder="Type your answer..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-md outline-none focus:border-blue-500"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage + 1} of {totalPages}
        </span>

        {currentPage + 1 === totalPages ? (
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition"
          >
            Submit Test
          </button>
        ) : (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
