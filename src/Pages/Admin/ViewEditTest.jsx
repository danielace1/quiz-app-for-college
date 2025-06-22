import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

const ViewEditTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testMeta, setTestMeta] = useState(null);
  const [testMetaEdit, setTestMetaEdit] = useState(null);
  const [editingMeta, setEditingMeta] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  const [addingNew, setAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswers: [],
    blankAnswer: "",
  });

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const testDocRef = doc(db, "tests", testId);
        const testDocSnap = await getDoc(testDocRef);

        if (testDocSnap.exists()) {
          const data = testDocSnap.data();
          setTestMeta(data);
          setTestMetaEdit(data);

          const questionsSnap = await getDocs(
            collection(testDocRef, "questions")
          );
          const qList = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(qList);
        } else {
          console.error("Test not found");
        }
      } catch (err) {
        console.error("Error fetching test:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  const handleSaveMeta = async () => {
    try {
      const testDocRef = doc(db, "tests", testId);
      await updateDoc(testDocRef, testMetaEdit);
      setTestMeta(testMetaEdit);
      setEditingMeta(false);
    } catch (err) {
      console.error("Failed to update test metadata", err);
    }
  };

  const handleSaveQuestion = async (questionId) => {
    try {
      const questionRef = doc(db, "tests", testId, "questions", questionId);
      await updateDoc(questionRef, editedQuestion);

      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = { ...editedQuestion, id: questionId };
      setQuestions(updatedQuestions);

      setEditingIndex(null);
      setEditedQuestion({});
    } catch (err) {
      console.error("Failed to update question", err);
      alert("Failed to update question.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmDelete = window.confirm("Delete this question?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tests", testId, "questions", questionId));
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete question.");
    }
  };

  const handleAddNewQuestion = async () => {
    try {
      const questionsRef = collection(db, "tests", testId, "questions");
      const docRef = await addDoc(questionsRef, newQuestion);
      setQuestions([...questions, { ...newQuestion, id: docRef.id }]);
      setAddingNew(false);
      setNewQuestion({
        type: "mcq",
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        blankAnswer: "",
      });
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Failed to add question.");
    }
  };

  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-3">
      <div className="mb-4 -ml-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        View / Edit Test
      </h2>

      <div className="bg-white rounded-lg p-6 shadow mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Test Details</h3>
          {!editingMeta && (
            <button
              onClick={() => setEditingMeta(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
        </div>

        {editingMeta ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Subject Name", key: "subjectName" },
              { label: "Subject Code", key: "subjectCode" },
              { label: "Test Code", key: "testCode" },
              {
                label: "Duration (Minutes)",
                key: "durationMinutes",
                type: "number",
              },
            ].map(({ label, key, type = "text" }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  value={testMetaEdit[key]}
                  onChange={(e) =>
                    setTestMetaEdit({
                      ...testMetaEdit,
                      [key]:
                        type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                  className={inputStyle}
                  type={type}
                  placeholder={label}
                />
              </div>
            ))}

            <div className="col-span-2 flex gap-4 mt-2">
              <button
                onClick={handleSaveMeta}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTestMetaEdit(testMeta);
                  setEditingMeta(false);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p>
              <strong>Subject:</strong> {testMeta.subjectName}
            </p>
            <p>
              <strong>Code:</strong> {testMeta.subjectCode}
            </p>
            <p>
              <strong>Test Code:</strong> {testMeta.testCode}
            </p>
            <p>
              <strong>Duration:</strong> {testMeta.durationMinutes} min
            </p>
            <p>
              <strong>Total Questions:</strong> {questions.length}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white p-6 rounded shadow relative">
            <div className="absolute right-4 top-4 flex gap-3">
              <button
                onClick={() => {
                  setEditingIndex(i);
                  setEditedQuestion(q);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <h4 className="font-semibold text-lg text-gray-700 mb-2">
              Question {i + 1}
            </h4>

            {editingIndex === i ? (
              <div className="space-y-3">
                <label className="block text-sm text-gray-600">Question</label>
                <input
                  value={editedQuestion.question || ""}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      question: e.target.value,
                    })
                  }
                  className={inputStyle}
                />
                {q.type === "mcq" &&
                  editedQuestion.options?.map((opt, idx) => (
                    <div key={idx}>
                      <label className="block text-sm text-gray-600">
                        Option {idx + 1}
                      </label>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...editedQuestion.options];
                          updated[idx] = e.target.value;
                          setEditedQuestion({
                            ...editedQuestion,
                            options: updated,
                          });
                        }}
                        className={inputStyle}
                      />
                    </div>
                  ))}

                {q.type === "fitb" && (
                  <>
                    <label className="block text-sm text-gray-600">
                      Correct Answer
                    </label>
                    <input
                      value={editedQuestion.blankAnswer || ""}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          blankAnswer: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />
                  </>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleSaveQuestion(q.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 mb-2">{q.question}</p>
                {q.type === "mcq" && (
                  <ul className="list-disc ml-6">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={
                          q.correctAnswers.includes(idx)
                            ? "font-semibold text-green-600"
                            : ""
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === "fitb" && (
                  <p className="text-blue-600">
                    Answer: <strong>{q.blankAnswer}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10">
        {!addingNew ? (
          <button
            onClick={() => setAddingNew(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add New Question
          </button>
        ) : (
          <div className="bg-white p-6 rounded shadow space-y-3 mt-6">
            <h4 className="font-semibold text-lg text-gray-700 mb-2">
              New Question
            </h4>

            <label className="block text-sm text-gray-600 mb-1 font-semibold">
              Question Type
            </label>
            <select
              value={newQuestion.type}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, type: e.target.value })
              }
              className={inputStyle}
            >
              <option value="mcq">MCQ</option>
              <option value="fitb">Fill in the Blank</option>
            </select>

            <label className="block text-sm text-gray-600 mt-2 font-semibold">
              Question
            </label>
            <input
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              className={inputStyle}
            />

            {newQuestion.type === "mcq" &&
              newQuestion.options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-sm text-gray-600 mb-2 font-semibold">
                    Option {idx + 1}
                  </label>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newQuestion.options];
                      updated[idx] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                    className={inputStyle}
                  />
                </div>
              ))}

            {newQuestion.type === "mcq" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">
                  Select Correct Answer(s)
                </label>
                {newQuestion.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newQuestion.correctAnswers.includes(idx)}
                      onChange={(e) => {
                        const updated = [...newQuestion.correctAnswers];
                        if (e.target.checked) {
                          updated.push(idx);
                        } else {
                          const indexToRemove = updated.indexOf(idx);
                          if (indexToRemove !== -1)
                            updated.splice(indexToRemove, 1);
                        }
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswers: updated,
                        });
                      }}
                    />
                    <span>{`Option ${idx + 1}`}</span>
                  </label>
                ))}
              </div>
            )}

            {newQuestion.type === "fitb" && (
              <>
                <label className="block text-sm text-gray-600">
                  Correct Answer
                </label>
                <input
                  value={newQuestion.blankAnswer}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      blankAnswer: e.target.value,
                    })
                  }
                  className={inputStyle}
                />
              </>
            )}

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleAddNewQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setAddingNew(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEditTest;
