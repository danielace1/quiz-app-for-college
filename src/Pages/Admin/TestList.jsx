import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testSnap = await getDocs(collection(db, "tests"));
        const testList = testSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTests(testList);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleDeleteTest = async (testId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this test?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tests", testId));
      setTests(tests.filter((test) => test.id !== testId));
    } catch (err) {
      console.error("Failed to delete test", err);
      alert("Failed to delete test.");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading tests...</p>;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 md:px-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        All Created Tests
      </h2>

      {tests.length === 0 ? (
        <p className="text-center text-gray-500">No tests created yet.</p>
      ) : (
        <div className="space-y-4">
          {tests.map((test, idx) => (
            <div
              key={test.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {idx + 1}. {test.subjectName} ({test.subjectCode})
                </p>
                <p className="text-sm text-gray-600">
                  Test Code: {test.testCode}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/admin/tests/${test.id}`)}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestList;
