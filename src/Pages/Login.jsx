import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

// Signup validation schema
const SignupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Name should be at least 3 characters" }),
    rollNo: z
      .string()
      .max(7, { message: "Roll No. should be atmost 7 characters" }),
    email: z.string().email({ message: "Email is required" }),
    password: z
      .string()
      .min(8, { message: "Password must contain at least 8 characters" })
      .regex(/[0-9]/g, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),
    cpassword: z.string(),
  })
  .refine((data) => data.password === data.cpassword, {
    message: "Passwords do not match",
    path: ["cpassword"],
  });

// Login validation schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});

const SignupAndLogin = () => {
  const [loginForm, setLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const Schema = loginForm ? LoginSchema : SignupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(Schema) });

  const signup = async (e) => {
    console.log(e);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        e.email,
        e.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "students", user.uid), {
        username: e.username,
        rollNo: e.rollNo,
        email: e.email,
      });

      console.log("Document written with ID: ", user.uid);
      alert("You have successfully signed up!");
      setLoginForm(true);
      reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      if (error.code === "auth/invalid-credential") {
        alert("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email or password");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Email already in use, Please Login!");
      }
    }
  };

  const login = async (e) => {
    console.log(e);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        e.email,
        e.password
      );
      const user = userCredential.user;
      console.log(user);

      alert("You have successfully logged in!");
      const userUID = user.uid;
      navigate(`/student/${userUID}`);
      reset();
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        alert("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        alert("Enter your valid email address");
      } else if (error.code === "auth/user-not-found") {
        alert("User not found, Please Sign Up!");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="pt-8 bg-orange-100 min-h-screen">
      <div className="bg-white flex items-center mx-60 rounded-lg">
        <div className="w-full relative">
          <img
            src="/quiz-time.png"
            alt="java-quiz-app"
            className="size-96 object-cover mx-auto"
          />
        </div>

        {/* Form */}
        {loginForm ? (
          // Login form
          <form
            action=""
            onSubmit={handleSubmit(login)}
            className="pr-10 py-8 w-full"
          >
            <h1 className="text-orange-500 font-semibold text-3xl mb-1">
              Welcome to Java Quiz App! 🚀
            </h1>
            <h2 className="text-orange-600 font-semibold text-lg">
              Login here!
            </h2>
            <hr className="mt-2" />
            <div className="mt-4 space-y-8">
              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  Enter Your Email :
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@awesome.com"
                  {...register("email")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.email ? "border border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <small className="text-red-500 text-sm">
                    {errors.email?.message}
                  </small>
                )}
              </div>
              <div className="relative">
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password :
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={handleShowPassword}
                  placeholder="********"
                  {...register("password")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.password ? "border border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <small className="text-red-500 text-sm">
                    {errors.password?.message}
                  </small>
                )}

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

              <div>
                <button className="w-full flex items-center justify-center bg-orange-400 text-white rounded-md px-4 py-2 font-semibold hover:bg-orange-500">
                  <span>
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
                  </span>
                  Login
                </button>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-orange-600 text-sm">
                    Don&apos;t have an account?
                  </span>
                  <button
                    onClick={() => {
                      setLoginForm(!true);
                      reset();
                    }}
                    type="button"
                    className="text-orange-600 text-sm font-semibold ml-2 hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          // Sign up form
          <form
            action=""
            onSubmit={handleSubmit(signup)}
            className="pr-10 py-8 w-full"
          >
            <h1 className="text-orange-500 font-semibold text-3xl mb-1">
              Welcome to Java Quiz App! 🚀
            </h1>
            <h2 className="text-orange-600 font-semibold text-lg">
              Sign Up here!
            </h2>
            <hr className="mt-2" />
            <div className="mt-4 space-y-8">
              <div>
                <label htmlFor="username" className="block font-semibold mb-2">
                  Enter Your name :
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Enter your Name"
                  {...register("username")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md capitalize ${
                    errors.username ? "border border-red-500" : ""
                  }`}
                />
                {errors.username && (
                  <small className="text-red-500 text-sm">
                    {errors.username?.message}
                  </small>
                )}
              </div>
              <div>
                <label htmlFor="rollNo" className="block font-semibold mb-2">
                  Roll No. :
                </label>
                <input
                  type="text"
                  name="rollNo"
                  id="rollNo"
                  placeholder="Enter your Roll No."
                  {...register("rollNo")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.rollNo ? "border border-red-500" : ""
                  }`}
                />
                {errors.rollNo && (
                  <small className="text-red-500 text-sm">
                    {errors.rollNo?.message}
                  </small>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  Enter Your Email :
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@awesome.com"
                  {...register("email")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.email ? "border border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <small className="text-red-500 text-sm">
                    {errors.email?.message}
                  </small>
                )}
              </div>
              <div className="relative">
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password :
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="********"
                  {...register("password")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.password ? "border border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <small className="text-red-500 text-sm">
                    {errors.password?.message}
                  </small>
                )}
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
              <div>
                <label htmlFor="cpassword" className="block font-semibold mb-2">
                  Confirm Password :
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="cpassword"
                  id="cpassword"
                  placeholder="Re-enter your password"
                  {...register("cpassword")}
                  className={`outline-none w-full bg-orange-50 px-5 py-2 rounded-md ${
                    errors.cpassword ? "border border-red-500" : ""
                  }`}
                />
                {errors.cpassword && (
                  <small className="text-red-500 text-sm">
                    {errors.cpassword?.message}
                  </small>
                )}
              </div>

              <div>
                <button className="w-full flex items-center justify-center bg-orange-400 text-white rounded-md px-4 py-2 font-semibold hover:bg-orange-500">
                  <span>
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
                  </span>
                  Sign Up
                </button>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-orange-600 text-sm">
                    Already have an account?
                  </span>
                  <button
                    onClick={() => {
                      setLoginForm(!false);
                      reset();
                    }}
                    type="button"
                    className="text-orange-600 text-sm font-semibold ml-2 hover:underline"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupAndLogin;
