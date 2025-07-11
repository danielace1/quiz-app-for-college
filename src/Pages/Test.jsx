import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Loader from "../components/Loader";
import TestCodeModal from "../components/TestCodeModal";

const Test = () => {
  const [tests, setTests] = useState([]);
  const [attendedTestIds, setAttendedTestIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) return navigate("/login");

          const snap = await getDocs(collection(db, "tests"));
          const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTests(list);

          const resultsSnap = await getDocs(
            query(collection(db, "results"), where("userId", "==", user.uid))
          );

          const attended = new Set();
          resultsSnap.forEach((doc) => {
            const result = doc.data();
            attended.add(result.testId);
          });

          setAttendedTestIds(attended);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching tests:", err);
        setLoading(false);
      }
    };

    fetchTests();
  }, [navigate]);

  const handleSubmitCode = (enteredCode) => {
    if (!selectedTest) return;

    if (enteredCode === selectedTest.testCode) {
      navigate(`/me/test/${selectedTest.id}`);
    } else {
      alert("Invalid test code. Please try again.");
    }
    setShowModal(false);
    setSelectedTest(null);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Available Tests
      </h2>

      {tests.length === 0 ? (
        <p className="text-center text-gray-500">No tests available yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tests.map((test, id) => {
            const attended = attendedTestIds.has(test.id);

            return (
              <div
                key={test.id}
                onClick={() => {
                  setSelectedTest(test);
                  setShowModal(true);
                }}
                className="relative bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 cursor-pointer transition-transform transform hover:-translate-y-1"
              >
                {attended && (
                  <div className="absolute top-2 right-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-800">
                  {id + 1}. {test.subjectName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{test.subjectCode}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Duration: {test.durationMinutes} min
                </p>
              </div>
            );
          })}
        </div>
      )}

      <TestCodeModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTest(null);
        }}
        onSubmit={handleSubmitCode}
      />
    </div>
  );
};

export default Test;
