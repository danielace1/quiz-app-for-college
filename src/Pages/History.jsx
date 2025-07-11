import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { BarChart, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const History = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserResults = async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          alert("Please login to view history.");
          return navigate("/login");
        }

        try {
          const allResultsSnap = await getDocs(collection(db, "results"));
          const userResults = allResultsSnap.docs
            .map((doc) => doc.data())
            .filter((res) => res.userId === user.uid);

          const enrichedResults = await Promise.all(
            userResults.map(async (res) => {
              const testDoc = await getDoc(doc(db, "tests", res.testId));
              return {
                ...res,
                testData: testDoc.exists() ? testDoc.data() : null,
              };
            })
          );

          setResults(enrichedResults);
        } catch (err) {
          console.error("Failed to load history:", err);
        } finally {
          setLoading(false);
        }
      });
    };

    fetchUserResults();
  }, [navigate]);

  const handleResult = async (res, testData) => {
    try {
      const qSnap = await getDocs(
        collection(db, "tests", res.testId, "questions")
      );
      const questions = qSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      navigate(`/me/test/${res.testId}/result`, {
        state: {
          testMeta: testData,
          questions,
          answers: res.answers,
          fromHistory: true,
        },
      });
    } catch (err) {
      console.error("Failed to fetch test questions:", err);
      alert("Failed to load result details. Try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-gray-800">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center flex items-center justify-center">
        <FileText className="inline-block w-6 h-6 mr-2 text-indigo-600" />
        Test History
      </h1>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-500">
          <BarChart className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No tests attended yet.</p>
          <p className="text-sm mt-1">Attend a test and it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((res, idx) => {
            const { testData } = res;
            if (!testData) return null;

            return (
              <div
                key={idx}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 transition hover:shadow-md"
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-indigo-700">
                      {idx + 1}. {testData.subjectName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {testData.subjectCode}
                    </p>
                    <p className="mt-2 text-sm flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Submitted: {new Date(res.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResult(res, testData)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow text-sm transition"
                  >
                    View Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
