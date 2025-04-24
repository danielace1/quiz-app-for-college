import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

// Schema
const SignupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Name should be at least 3 characters" }),
    rollNo: z
      .string()
      .max(7, { message: "Roll No. should be at most 7 characters" }),
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  // 👁️ Toggle password
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Signup function
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
        rollNo: data.rollNo,
        email: data.email,
        role: "user",
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
    <div className="min-h-screen bg-orange-100 flex items-center justify-center">
      <div className="bg-white flex items-center mx-60 rounded-lg">
        <div className="w-full relative">
          <img
            src="/quiz-time.png"
            alt="quiz-img"
            className="size-96 object-cover mx-auto"
          />
        </div>
        <form
          onSubmit={handleSubmit(signup)}
          className="pr-10 py-8 w-full max-w-md"
        >
          <h1 className="text-orange-500 font-semibold text-3xl mb-1">
            Welcome to Quiz Craze App! 🚀
          </h1>
          <h2 className="text-orange-600 font-semibold text-lg">
            Sign Up here!
          </h2>
          <hr className="mt-2" />
          <div className="mt-4 space-y-8">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block font-semibold mb-2">
                Enter Your name:
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your Name"
                {...register("username")}
                className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md capitalize ${
                  errors.username ? "border border-red-500" : ""
                }`}
              />
              {errors.username && (
                <small className="text-red-500 text-sm">
                  {errors.username.message}
                </small>
              )}
            </div>

            {/* Roll No */}
            <div>
              <label htmlFor="rollNo" className="block font-semibold mb-2">
                Roll No.:
              </label>
              <input
                type="text"
                id="rollNo"
                placeholder="Enter your Roll No."
                {...register("rollNo")}
                className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                  errors.rollNo ? "border border-red-500" : ""
                }`}
              />
              {errors.rollNo && (
                <small className="text-red-500 text-sm">
                  {errors.rollNo.message}
                </small>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-semibold mb-2">
                Enter Your Email:
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

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block font-semibold mb-2">
                Password:
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
              {/* Toggle Eye */}
              <div
                className="absolute top-10 right-3"
                onClick={handleShowPassword}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    className="fill-current hover:cursor-pointer text-orange-300 hover:text-orange-400"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    >
                      <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0"></path>
                      <path d="M2 12c1.6-4.097 5.336-7 10-7s8.4 2.903 10 7c-1.6 4.097-5.336 7-10 7s-8.4-2.903-10-7"></path>
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    className="fill-current hover:cursor-pointer text-orange-300 hover:text-orange-400"
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
                      ></path>
                      <path d="m4 4l16 16"></path>
                    </g>
                  </svg>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="cpassword" className="block font-semibold mb-2">
                Confirm Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="cpassword"
                placeholder="Re-enter your password"
                {...register("cpassword")}
                className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                  errors.cpassword ? "border border-red-500" : ""
                }`}
              />
              {errors.cpassword && (
                <small className="text-red-500 text-sm">
                  {errors.cpassword.message}
                </small>
              )}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-orange-400 text-white rounded-md px-4 py-2 font-semibold hover:bg-orange-500"
              >
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
                  ></path>
                </svg>
                Sign Up
              </button>
              <div className="flex items-center justify-center mt-4">
                <span className="text-orange-600 text-sm">
                  Already have an account?
                </span>
                <a
                  href="/login"
                  className="text-orange-600 text-sm font-semibold ml-2 hover:underline"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
