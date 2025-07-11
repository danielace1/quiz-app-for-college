import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import TestCodeModal from "../components/TestCodeModal";

const Test = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const snap = await getDocs(collection(db, "tests"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTests(list);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

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
          {tests.map((test, id) => (
            <div
              key={test.id}
              onClick={() => {
                setSelectedTest(test);
                setShowModal(true);
              }}
              className="bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 cursor-pointer transition-transform transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {id + 1}. {test.subjectName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{test.subjectCode}</p>
              <p className="text-sm text-gray-500 mt-1">
                Duration: {test.durationMinutes} min
              </p>
            </div>
          ))}
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
