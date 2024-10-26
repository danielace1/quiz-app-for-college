import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="bg-orange-100 min-h-screen flex flex-col items-center justify-center">
      <img src="/404.png" alt="404 Page Not Found" className="w-[450px]" />
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-orange-400 text-center mt-10">
        Oops! Page Not Found
      </h1>
      <div className="mt-5 text-center">
        <Link
          to="/signup-login"
          className="text-orange-500 font-semibold text-lg md:text-xl lg:text-2xl underline hover:text-orange-600"
        >
          Go back
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
