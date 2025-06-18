import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Brain, Rocket, Sparkles } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const login = async (e) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        e.email,
        e.password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        alert("User record not found. Contact support team.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role === "user") {
        navigate(`/me`);
      } else if (userData.role === "admin") {
        navigate(`/admin`);
      }

      alert("You have successfully logged in!");

      reset();
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-email"
      ) {
        alert("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        alert("User not found, Please Sign Up!");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center md:items-stretch">
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
              Challenge yourself with exciting quizzes and expand your
              knowledge!
            </p>
            <div className="mt-8 relative">
              <div className="absolute -top-6 -left-6">
                <Sparkles size={20} className="text-blue-400" />
              </div>
              <div className="absolute -bottom-4 -right-4">
                <Sparkles size={20} className="text-yellow-500" />
              </div>
              <div className="bg-white/55 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <p className="text-gray-700 font-medium">
                  Ready to test your knowledge and have fun while learning?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 w-full p-8 md:p-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              👋 Welcome Back!
            </h2>
            <p className="text-gray-600 mb-8">Please sign in to your account</p>

            <form onSubmit={handleSubmit(login)} className="space-y-6">
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
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
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
                    className={`w-full outline-none px-4 py-2.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
              </button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
