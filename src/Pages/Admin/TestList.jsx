import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import ConfirmationModal from "../../components/Admin/ConfirmationModal";
import SearchInput from "../../components/Admin/SearchInput";
import Pagination from "../../components/Admin/Pagination";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "tests"));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTests(list);
      setFiltered(list);
      setLoading(false);
    };
    fetchTests();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      const questionsRef = collection(db, "tests", id, "questions");
      const questionsSnap = await getDocs(questionsRef);

      const deletePromises = questionsSnap.docs.map((qDoc) =>
        deleteDoc(doc(db, "tests", id, "questions", qDoc.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "tests", id));

      const newList = tests.filter((t) => t.id !== id);
      setTests(newList);
      setFiltered(newList);
    } catch (err) {
      console.error("Error deleting test and its questions:", err);
      alert("Failed to delete test.");
    }
  };
  const handleSearch = (query) => {
    const lower = query.trim().toLowerCase();
    setFiltered(
      tests.filter(
        (t) =>
          t.subjectName.toLowerCase().includes(lower) ||
          t.subjectCode.toLowerCase().includes(lower) ||
          t.testCode.toLowerCase().includes(lower)
      )
    );
    setCurrentPage(1);
  };

  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 md:px-6 space-y-4">
      <div className="md:flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">All Created Tests</h2>
        <button
          onClick={() => navigate("/admin/createtest")}
          className="hidden md:flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus className="w-5 h-5" /> Create Test
        </button>
      </div>

      <SearchInput placeholder="Search tests…" onSearch={handleSearch} />

      {paged.length === 0 ? (
        <p className="text-center text-gray-500 mt-5">No tests found.</p>
      ) : (
        paged.map((test, idx) => (
          <div
            key={test.id}
            onClick={() => navigate(`/admin/tests/${test.id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer transition group"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex-1">
                <p className="font-medium text-gray-800 group-hover:underline mb-1">
                  {start + idx + 1}. {test.subjectName} ({test.subjectCode})
                </p>
                <p className="text-sm text-gray-600">
                  Test Code: {test.testCode}
                </p>
              </div>

              <div className="flex gap-3 self-end sm:self-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/tests/${test.id}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(test.id);
                  }}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <Pagination
        current={currentPage}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setCurrentPage}
      />

      <ConfirmationModal
        open={!!deleteTarget}
        title="Confirm Delete"
        message="Are you sure you want to delete this test? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TestList;
