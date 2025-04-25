import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Brain, Rocket, Sparkles, UserPlus } from "lucide-react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

const SignupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Name should be at least 3 characters" }),
    regNo: z
      .string()
      .max(12, { message: "Register No. should not exceed 12 characters" }),
    email: z.string().email({ message: "Email is required" }),
    password: z
      .string()
      .min(8, { message: "Password must contain at least 8 characters" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Must contain at least one special character",
      }),
    cpassword: z.string(),
  })
  .refine((data) => data.password === data.cpassword, {
    message: "Passwords do not match",
    path: ["cpassword"],
  });

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const signup = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: data.username,
        regNo: data.regNo,
        email: data.email,
        role: "user",
        createdAt: new Date().toISOString(),
      });
      alert("Signup successful!");
      navigate("/login");
      reset();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use");
      } else {
        alert("Signup failed: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center md:items-stretch">
        <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-yellow-50 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 rounded-full"></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <Brain size={64} className="text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-4">
              Quiz Craze
              <span className="inline-block ml-2">
                <Rocket className="inline-block w-8 h-8 text-yellow-500 animate-bounce" />
              </span>
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Join our community of learners and challenge yourself!
            </p>
            <div className="mt-8 relative">
              <div className="absolute -top-6 -left-6">
                <Sparkles size={20} className="text-blue-400" />
              </div>
              <div className="absolute -bottom-4 -right-4">
                <Sparkles size={20} className="text-yellow-500" />
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <p className="text-gray-700 font-medium">
                  Create your account and start your learning journey today!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 w-full p-8 md:p-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Get Started !
            </h2>
            <p className="text-gray-600 mb-8">Create your account</p>

            <form onSubmit={handleSubmit(signup)} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="John Doe"
                  {...register("username")}
                  className={`w-full outline-none px-4 py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="regNo"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Register Number
                </label>
                <input
                  type="number"
                  id="regNo"
                  placeholder="Enter your register number"
                  {...register("regNo")}
                  className={`w-full outline-none px-4 py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                    errors.regNo ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.regNo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.regNo.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@awesome.com"
                  {...register("email")}
                  className={`w-full outline-none px-4 py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full outline-none px-4 py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cpassword"
                  className="block font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="cpassword"
                    placeholder="••••••••"
                    {...register("cpassword")}
                    className={`w-full outline-none px-4 py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.cpassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.cpassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cpassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <UserPlus size={20} />
                <span>Create Account</span>
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
