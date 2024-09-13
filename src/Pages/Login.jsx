import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});

const SignupAndLogin = () => {
  const [loginForm, setLoginForm] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(Schema) });

  const sendToFB = (e) => {
    console.log(e);
  };

  return (
    <div className="pt-8 bg-orange-100 min-h-screen">
      <div className="bg-white flex space-x-2 mx-60 rounded-lg">
        <div className="w-full">
          <img
            src="/quiz-time.png"
            alt=""
            className="size-96 object-cover mx-5"
          />
        </div>

        {/* Form */}
        {loginForm ? (
          // Login form
          <form
            action=""
            onSubmit={handleSubmit(sendToFB)}
            className="pr-10 py-8 w-full"
          >
            <h1 className="text-orange-500 font-semibold text-2xl mb-1">
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
              <div>
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password :
                </label>
                <input
                  type="password"
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
                    Don't have an account?
                  </span>
                  <button
                    onClick={() => setLoginForm(!true)}
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
            onSubmit={handleSubmit(sendToFB)}
            className="pr-10 py-8 w-full"
          >
            <h1 className="text-orange-500 font-semibold text-2xl mb-1">
              Welcome to Java Quiz App! 🚀
            </h1>
            <h2 className="text-orange-600 font-semibold text-lg">
              Sign Up here!
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
              <div>
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password :
                </label>
                <input
                  type="password"
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
                    onClick={() => setLoginForm(!false)}
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
