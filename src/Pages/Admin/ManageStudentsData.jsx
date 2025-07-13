import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import ConfirmationModal from "../../components/Admin/ConfirmationModal";
import Pagination from "../../components/Admin/Pagination";

const PAGE_SIZE = 30;

const ManageStudentsData = () => {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState("username");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const usersSnap = await getDocs(collection(db, "users"));
      const resultsSnap = await getDocs(collection(db, "results"));

      const userList = usersSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role !== "admin");

      const resultList = resultsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      userList.sort((a, b) =>
        String(a.regNo || "").localeCompare(String(b.regNo || ""))
      );

      setStudents(userList);
      setFiltered(userList);
      setResults(resultList);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lower = searchQuery.trim().toLowerCase();
    const filteredList = students.filter((s) =>
      String(s[searchField] || "")
        .toLowerCase()
        .includes(lower)
    );
    setFiltered(filteredList);
    setCurrentPage(1);
  }, [searchQuery, searchField, students]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const getUserResults = (userId) =>
    results.filter((res) => res.userId === userId);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { userId, type } = deleteTarget;
    setDeleteTarget(null);

    try {
      if (type === "student") {
        await deleteDoc(doc(db, "users", userId));
      }

      const toDelete = results.filter((r) => {
        return type === "all-users" || r.userId === userId;
      });

      await Promise.all(
        toDelete.map((r) => deleteDoc(doc(db, "results", r.id)))
      );

      if (type === "student") {
        setStudents((prev) => prev.filter((u) => u.id !== userId));
        setFiltered((prev) => prev.filter((u) => u.id !== userId));
        toast.success("Student and all results deleted successfully.");
      }

      if (type === "all-users") {
        setResults([]);
        toast.success("All results cleared for all users.");
      } else {
        setResults((prev) => prev.filter((r) => r.userId !== userId));
        toast.success("Results cleared successfully.");
      }
    } catch (err) {
      console.error("Error deleting student or results:", err);
      alert("Failed to delete.");
    }
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
    <div className="max-w-7xl mx-auto md:px-10 md:py-6 text-gray-800">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" />
        Manage Students
      </h2>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="border border-blue-400 px-4 py-2 rounded-md text-sm shadow-sm outline-none focus:border-blue-600"
          >
            <option value="username">Name</option>
            <option value="regNo">Reg No</option>
            <option value="email">Email</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="border border-blue-400 px-4 py-2 rounded-md text-sm shadow-sm outline-none focus:border-blue-600 w-64 transition"
          />
        </div>

        <button
          onClick={() => setDeleteTarget({ type: "all-users" })}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm shadow-md"
        >
          <Trash2 className="w-4 h-4" />
          Clear Results for All Users
        </button>
      </div>

      <div className="overflow-x-auto mt-6 rounded-lg border shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">#</th>
              <th className="px-4 py-2 text-left font-semibold">Name</th>
              <th className="px-4 py-2 text-left font-semibold">Reg No</th>
              <th className="px-4 py-2 text-left font-semibold">Email</th>
              <th className="px-4 py-2 text-left font-semibold">Results</th>
              <th className="px-4 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              paged.map((student, index) => {
                const userResults = getUserResults(student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{start + index + 1}</td>
                    <td className="px-4 py-2">
                      {student.username || "Unnamed"}
                    </td>
                    <td className="px-4 py-2">{student.regNo}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{userResults.length}</td>
                    <td className="px-4 py-2 space-y-2">
                      <button
                        onClick={() =>
                          setDeleteTarget({ userId: student.id, type: "all" })
                        }
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Results
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            userId: student.id,
                            type: "student",
                          })
                        }
                        className="text-red-700 hover:text-red-900 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Student
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        current={currentPage}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setCurrentPage}
      />

      <ConfirmationModal
        open={!!deleteTarget}
        title="Confirm Deletion"
        message={`Are you sure you want to ${
          deleteTarget?.type === "all"
            ? "clear all results for this student"
            : deleteTarget?.type === "student"
            ? "delete this student and all related data"
            : "clear results for all users"
        }?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageStudentsData;
