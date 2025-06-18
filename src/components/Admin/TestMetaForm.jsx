import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useTestStore from "../../store/testStore";

const testMetaSchema = z.object({
  subjectName: z.string().min(3, "Subject name must be at least 3 characters"),
  subjectCode: z.string().min(2, "Code is too short"),
  totalQuestions: z
    .number({ invalid_type_error: "Total Questions is required" })
    .min(1, "Must be at least 1")
    .max(100, "Too many questions"),
});

const TestMetaForm = () => {
  const setTestMeta = useTestStore((state) => state.setTestMeta);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testMetaSchema),
    defaultValues: {
      subjectName: "",
      subjectCode: "",
      totalQuestions: "",
    },
  });

  const submitMeta = (data) => {
    setTestMeta(data);
  };

  return (
    <div className="px-4 pt-6 lg:pt-10 lg:px-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Test</h2>
      <form onSubmit={handleSubmit(submitMeta)} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Subject Name
          </label>
          <input
            type="text"
            {...register("subjectName")}
            className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
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

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold"
        >
          Next : Add Questions
        </button>
      </form>
    </div>
  );
};

export default TestMetaForm;
