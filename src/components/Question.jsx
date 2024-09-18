import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";

const Question = () => {
  const [excelData, setExcelData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [user, setUser] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchExcelFile() {
      try {
        const response = await fetch("/Data/Questions.xlsx");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length === 0) {
          throw new Error("Empty sheet");
        }

        // first row contains the headers
        const [headers, ...rows] = rawData;

        const questions = rows.map((row) => {
          const question = {};
          headers.forEach((header, index) => {
            question[header] = row[index];
          });
          return question;
        });

        setExcelData(questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchExcelFile();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % excelData.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? excelData.length - 1 : prevIndex - 1
    );
  };

  const handleOptionClick = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please log in to submit your answers.");
      return;
    }

    try {
      const answers = Object.entries(selectedOptions).map(
        ([index, option]) => ({
          questionIndex: parseInt(index, 10),
          selectedOption: option,
        })
      );

      const userDoc = doc(db, "studentAnswers", user.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const currentDate = new Date();

        if (currentDate < new Date(data.expiryDate)) {
          alert("You have already submitted this quiz.");
          return;
        }
      }

      await setDoc(userDoc, {
        id,
        answers,
        expiryDate: new Date(
          new Date().getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        timestamp: serverTimestamp(),
      });

      alert("Your answers have been submitted successfully!");
      navigate("/student/" + id + "/final", { replace: true });

      // Document deleted after 24 hours from DB
      setTimeout(async () => {
        await deleteDoc(userDoc);
        console.log("Document deleted after 24 hours");
      }, 24 * 60 * 60 * 1000);
    } catch (err) {
      alert("An error occurred while submitting your answers: " + err.message);
    }
  };

  const selectedOption = selectedOptions[currentIndex] || null;
  const isOptionSelected = selectedOptions[currentIndex] !== undefined;

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (excelData.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQuestion = excelData[currentIndex];

  return (
    <div className="mt-5">
      <h1 className="text-xl font-semibold">
        {currentIndex + 1}. {currentQuestion.Question}
      </h1>
      <div className="mt-5 flex flex-col justify-center space-y-5">
        {["Option1", "Option2", "Option3", "Option4"].map((option) => (
          <div
            key={option}
            className={`flex items-center space-x-3 p-3 border border-orange-100 rounded-lg hover:cursor-pointer ${
              selectedOption === option ? "bg-orange-50" : ""
            }`}
            onClick={() => handleOptionClick(option)}
          >
            <input
              type="radio"
              id={option}
              name="options"
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionClick(option)}
              className="h-4 w-4  hover:cursor-pointer"
            />
            <label
              htmlFor={option}
              className="font-semibold text-orange-500  hover:cursor-pointer"
            >
              {currentQuestion[option]}
            </label>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <div>
          {currentIndex > 0 && (
            <button
              className="bg-sky-500 text-white text-lg font-semibold px-5 py-1.5 hover:bg-sky-600 rounded-lg"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
        </div>
        <div className="">
          {currentIndex < excelData.length - 1 ? (
            <button
              className={`bg-orange-400 text-white text-lg font-semibold px-5 py-1.5 rounded-lg ${
                isOptionSelected
                  ? "hover:bg-orange-500"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleNext}
              disabled={!isOptionSelected}
            >
              Next
            </button>
          ) : (
            <button
              className="bg-red-500 text-white text-lg font-semibold px-5 py-1.5 hover:bg-red-600 rounded-lg"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;
