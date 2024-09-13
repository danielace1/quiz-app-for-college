import { Link } from "react-router-dom";

const GuestLayout = () => {
  return (
    <div className="pt-20 bg-orange-100 min-h-screen">
      <div className="bg-white rounded-lg mx-auto max-w-lg p-10">
        <h1 className="text-orange-500 font-semibold text-2xl text-center mb-3">
          Welcome to Java Quiz App! 🚀
        </h1>
        <p className="font-semibold text-center">
          Get ready to test your Java programming skills and improve your
          knowledge. Log in or sign up to get started!
        </p>

        <div className="mt-8 text-center">
          <Link to={"/signup&login"}>
            <button className="bg-orange-400 text-white rounded-md px-14 py-2 font-semibold hover:bg-orange-500 text-lg">
              Get Started 🎯
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestLayout;
