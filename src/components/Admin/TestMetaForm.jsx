import Proptypes from "prop-types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import useTestStore from "../../store/testStore";
import { generateTestCode } from "../../utils/generateTestCode";

const testMetaSchema = z.object({
  subjectName: z.string().min(3, "Subject name must be at least 3 characters"),
  subjectCode: z.string().min(2, "Code is too short"),
  totalQuestions: z
    .number({ invalid_type_error: "Total No. of Questions is required" })
    .min(1, "Must be at least 1")
    .max(100, "Too many questions"),
  durationMinutes: z
    .number({ invalid_type_error: "Duration is required" })
    .min(1, "Minimum 1 minute"),
  testCode: z.string().min(4, "Test code must be at least 4 characters"),
});

const TestMetaForm = ({ onNext }) => {
  const [generatedCode, setGeneratedCode] = useState("");

  const setTestMeta = useTestStore((state) => state.setTestMeta);
  const testMeta = useTestStore((state) => state.testMeta);
  const resetTestMeta = useTestStore((state) => state.resetTest);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(testMetaSchema),
    defaultValues: testMeta || {
      subjectName: "",
      subjectCode: "",
      totalQuestions: "",
      durationMinutes: "",
      testCode: "",
    },
  });

  useEffect(() => {
    const checkAndSetUniqueCode = async () => {
      let unique = false;
      let code = "";

      while (!unique) {
        code = generateTestCode();

        const q = query(collection(db, "tests"), where("testCode", "==", code));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          unique = true;
          setGeneratedCode(code);
          setValue("testCode", code);
        }
      }
    };

    checkAndSetUniqueCode();
  }, []);

  const submitMeta = async (data) => {
    try {
      const q = query(
        collection(db, "tests"),
        where("testCode", "==", data.testCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert(
          `Test Code "${data.testCode}" already exists. Please choose another.`
        );
        return;
      }

      setTestMeta(data);
      onNext();
    } catch (err) {
      console.error("Error checking test code:", err);
      alert(
        "An error occurred while checking the test code. Please try again."
      );
    }
  };

  const handleClear = () => {
    reset({
      subjectName: "",
      subjectCode: "",
      totalQuestions: "",
      durationMinutes: "",
      testCode: "",
    });

    resetTestMeta();
  };

  return (
    <div className="px-4 pt-6 pb-3 lg:pt-10 lg:px-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Test</h2>
      <form onSubmit={handleSubmit(submitMeta)} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Subject Name
          </label>
          <input
            type="text"
            {...register("subjectName")}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 capitalize ${
              errors.subjectName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Eg: Object-Oriented Programming"
          />
          {errors.subjectName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.subjectName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Subject Code
          </label>
          <input
            type="text"
            {...register("subjectCode")}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
              errors.subjectCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Eg: CS3391"
          />
          {errors.subjectCode && (
            <p className="text-sm text-red-500 mt-1">
              {errors.subjectCode.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            No. of Questions
          </label>
          <input
            type="number"
            {...register("totalQuestions", { valueAsNumber: true })}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
              errors.totalQuestions ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Eg: 5"
          />
          {errors.totalQuestions && (
            <p className="text-sm text-red-500 mt-1">
              {errors.totalQuestions.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Test Duration (minutes)
          </label>
          <input
            type="number"
            {...register("durationMinutes", { valueAsNumber: true })}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500  ${
              errors.durationMinutes ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Eg: 30"
          />
          {errors.durationMinutes && (
            <p className="text-sm text-red-500 mt-1">
              {errors.durationMinutes.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Test Code
          </label>
          <input
            type="text"
            {...register("testCode")}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500  ${
              errors.testCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Eg: OOP123"
            defaultValue={generatedCode}
          />
          {errors.testCode && (
            <p className="text-sm text-red-500 mt-1">
              {errors.testCode.message}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-2.5 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Clear
          </button>
          <button
            type="submit"
            className="w-full outline-none py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold"
          >
            Next : Add Questions
          </button>
        </div>
      </form>
    </div>
  );
};

TestMetaForm.propTypes = {
  onNext: Proptypes.func,
};

export default TestMetaForm;
