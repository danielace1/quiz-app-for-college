import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Users, FileText, BarChart2, CalendarDays } from "lucide-react";
import moment from "moment";
import AdminDashboardCard from "../../components/Admin/AdminDashboardCard";

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [tests, setTests] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      setUsersCount(usersSnap.size);

      const testsSnap = await getDocs(collection(db, "tests"));
      const testData = testsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const resultsSnap = await getDocs(collection(db, "results"));
      setResultsCount(resultsSnap.size);

      const resultData = resultsSnap.docs.map((doc) => doc.data());

      const testsWithSubmissions = testData.map((test) => {
        const submissions = resultData.filter((res) => res.testId === test.id);
        return {
          ...test,
          submissions: submissions.length,
        };
      });

      setTests(testsWithSubmissions);
    };

    fetchStats();
  }, []);

  const latestTests = [...tests]
    .sort(
      (a, b) =>
        new Date(b.createdAt?.toDate?.() || 0) -
        new Date(a.createdAt?.toDate?.() || 0)
    )
    .slice(0, 5);

  return (
    <div className="md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <AdminDashboardCard
          icon={<Users size={20} />}
          label="Total Users"
          value={`${usersCount} users`}
        />
        <AdminDashboardCard
          icon={<FileText size={20} />}
          label="Total Tests"
          value={`${tests.length} tests`}
        />
        <AdminDashboardCard
          icon={<BarChart2 size={20} />}
          label="Total Results"
          value={`${resultsCount} submissions`}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          Recent Test Activity
        </h2>
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-blue-50 text-blue-800">
              <tr>
                <th className="px-4 py-2 font-semibold text-left">#</th>
                <th className="px-4 py-2 font-semibold text-left">Test Name</th>
                <th className="px-4 py-2 font-semibold text-left">
                  Created At
                </th>
                <th className="px-4 py-2 font-semibold text-center">
                  Questions
                </th>
                <th className="px-4 py-2 font-semibold text-center">
                  Submissions
                </th>
              </tr>
            </thead>
            <tbody>
              {latestTests.map((test, idx) => (
                <tr
                  key={test.id}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-left">{idx + 1}</td>
                  <td className="px-4 py-3 text-left">
                    {test.subjectName || "Untitled"}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {moment(test.createdAt?.toDate?.()).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {test.totalQuestions || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {test.submissions || 0}
                  </td>
                </tr>
              ))}

              {latestTests.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
