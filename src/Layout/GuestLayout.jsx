import { Link } from "react-router-dom";

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-4">
          Welcome to <span className="text-yellow-500">Quiz Craze</span> 🎉
        </h1>
        <p className="text-gray-700 text-base mb-6">
          Challenge yourself with fun quizzes across a variety of topics. Play,
          learn, and climb the leaderboard! Ready to begin?
        </p>

        <Link to="/login">
          <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-2.5 px-8 rounded-lg transition duration-300 shadow-md">
            Get Started 🚀
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GuestLayout;
