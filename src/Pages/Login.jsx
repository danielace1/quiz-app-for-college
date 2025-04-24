import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

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
      const userData = userDoc.data();

      if (userData.role !== "user") {
        alert("You are not authorized to access this page.");
        return;
      }

      alert("You have successfully logged in!");
      navigate(`/student/${user.uid}`);
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
    <div className="pt-8 pb-10 bg-orange-100 min-h-screen">
      <div className="bg-white flex items-center mx-60 rounded-lg">
        <div className="w-full relative">
          <img
            src="/quiz-time.png"
            alt="quiz-img"
            className="size-96 object-cover mx-auto"
          />
        </div>

        <form onSubmit={handleSubmit(login)} className="pr-10 py-8 w-full">
          <h1 className="text-orange-500 font-semibold text-3xl mb-1">
            Welcome to Quiz Craze! 🚀
          </h1>
          <h2 className="text-orange-600 font-semibold text-lg">Login here!</h2>
          <hr className="mt-2" />

          <div className="mt-4 space-y-8">
            <div>
              <label htmlFor="email" className="block font-semibold mb-2">
                Enter Your Email :
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@awesome.com"
                {...register("email")}
                className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                  errors.email ? "border border-red-500" : ""
                }`}
              />
              {errors.email && (
                <small className="text-red-500 text-sm">
                  {errors.email.message}
                </small>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block font-semibold mb-2">
                Password :
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                {...register("password")}
                className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                  errors.password ? "border border-red-500" : ""
                }`}
              />
              {errors.password && (
                <small className="text-red-500 text-sm">
                  {errors.password.message}
                </small>
              )}

              <div
                className="absolute top-10 right-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    className="text-orange-400 hover:cursor-pointer"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    >
                      <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
                      <path d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7" />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    className="text-orange-400 hover:cursor-pointer"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinejoin="round"
                        d="M10.73 5.073A11 11 0 0 1 12 5c4.664 0 8.4 2.903 10 7a11.6 11.6 0 0 1-1.555 2.788M6.52 6.519C4.48 7.764 2.9 9.693 2 12c1.6 4.097 5.336 7 10 7a10.44 10.44 0 0 0 5.48-1.52m-7.6-7.6a3 3 0 1 0 4.243 4.243"
                      />
                      <path d="m4 4l16 16" />
                    </g>
                  </svg>
                )}
              </div>
            </div>

            <div>
              <button className="w-full bg-orange-400 text-white rounded-md px-4 py-2 font-semibold hover:bg-orange-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  className="mr-2"
                >
                  <path
                    fill="currentColor"
                    d="m144.49 136.49l-40 40a12 12 0 0 1-17-17L107 140H24a12 12 0 0 1 0-24h83L87.51 96.49a12 12 0 0 1 17-17l40 40a12 12 0 0 1-.02 17M200 28h-64a12 12 0 0 0 0 24h52v152h-52a12 12 0 0 0 0 24h64a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12"
                  />
                </svg>
                Login
              </button>
              <div className="flex items-center justify-center mt-4">
                <span className="text-orange-600 text-sm">
                  Don't have an account?
                </span>
                <a
                  href="/signup"
                  className="text-orange-600 text-sm font-semibold ml-2 hover:underline"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
