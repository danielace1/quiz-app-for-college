import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Trophy, User, AlertTriangle } from "lucide-react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Loader from "../components/Loader";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const normalize = (val) =>
    Array.isArray(val)
      ? val
          .flatMap((v) =>
            String(v)
              .toLowerCase()
              .replace(/[.,]/g, "")
              .split(/[\s,]+/)
              .map((word) => word.trim())
              .filter(Boolean)
          )
          .sort()
      : [];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const resultsSnap = await getDocs(collection(db, "results"));
        const allResults = resultsSnap.docs.map((doc) => doc.data());

        const testMap = {};
        const userMap = {};

        for (const result of allResults) {
          if (!testMap[result.testId]) {
            const testSnap = await getDoc(doc(db, "tests", result.testId));
            if (testSnap.exists()) testMap[result.testId] = testSnap.data();
          }
          if (!userMap[result.userId]) {
            const userSnap = await getDoc(doc(db, "users", result.userId));
            if (userSnap.exists()) userMap[result.userId] = userSnap.data();
          }
        }

        const subjectWise = {};
        for (const result of allResults) {
          const test = testMap[result.testId];
          const user = userMap[result.userId];
          if (!test || !user) continue;

          const key = `${test.subjectCode} - ${test.subjectName}`;
          if (!subjectWise[key]) subjectWise[key] = [];

          const questionsSnap = await getDocs(
            collection(db, "tests", result.testId, "questions")
          );
          const questionMap = {};
          questionsSnap.forEach((doc) => {
            questionMap[doc.id] = doc.data();
          });

          const correctCount = Object.entries(result.answers || {}).filter(
            ([qid, ans]) => {
              const q = questionMap[qid];
              if (!q) return false;

              const correct =
                q.type === "fitb"
                  ? [q.blankAnswer ?? ""]
                  : q.correctAnswers || [];
              const selected = q.type === "fitb" ? [ans?.[0] || ""] : ans || [];

              const normCorrect = normalize(correct);
              const normSelected = normalize(selected);

              const correctSet = new Set(normCorrect);
              const selectedSet = new Set(normSelected);

              return (
                correctSet.size === selectedSet.size &&
                [...correctSet].every((item) => selectedSet.has(item))
              );
            }
          ).length;

          subjectWise[key].push({
            name: user.username,
            regno: user.regNo,
            marks: correctCount,
            timeTaken: result.timeTaken || 0,
          });
        }

        Object.keys(subjectWise).forEach((key) => {
          subjectWise[key].sort((a, b) => {
            if (b.marks === a.marks) return a.timeTaken - b.timeTaken;
            return b.marks - a.marks;
          });
        });

        setLeaderboardData(subjectWise);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleExport = () => {
    const exportData = [];

    Object.keys(leaderboardData).forEach((subject) => {
      leaderboardData[subject].forEach((entry, i) => {
        exportData.push({
          Subject: subject,
          Rank: i + 1,
          RegNo: String(entry.regno),
          Name: entry.name,
          Marks: entry.marks,
          "Time Taken": `${Math.floor(entry.timeTaken / 60)}m ${
            entry.timeTaken % 60
          }s`,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const colWidths = Object.keys(exportData[0]).map((key) => {
      const maxLength = exportData.reduce(
        (w, row) => Math.max(w, String(row[key]).length),
        key.length
      );
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");

    XLSX.writeFile(workbook, "leaderboard.xlsx");
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );

  return (
    <div className="max-w-6xl p-2 mx-auto text-gray-800">
      <h1 className="flex items-center  justify-center text-2xl sm:text-4xl font-bold text-center mb-4 md:mb-8">
        <Trophy className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 text-yellow-500" />{" "}
        Leaderboard
      </h1>

      {Object.keys(leaderboardData).length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-20">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
          <p className="text-lg font-medium text-center">
            No results yet.
            <br />
            Be the first to take the test!
          </p>
        </div>
      ) : (
        Object.keys(leaderboardData).map((subject, idx) => (
          <div key={idx} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-2xl font-semibold text-blue-700">
                {subject}
              </h2>

              <div>
                {userRole === "admin" && (
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
                  >
                    Export Results
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 shadow-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Reg No.
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Time Taken
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {leaderboardData[subject].map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-100">
                      <td className="px-6 py-4 font-bold text-gray-700">
                        #{i + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{entry.regno}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" /> {entry.name}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-semibold">
                        {entry.marks}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.floor(entry.timeTaken / 60)}m{" "}
                        {entry.timeTaken % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Leaderboard;
