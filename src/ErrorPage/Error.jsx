import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeftCircle } from "lucide-react";

const ErrorPage = () => {
  const [redirectPath, setRedirectPath] = useState("/signup-login");

  useEffect(() => {
    const checkUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();

        if (data?.role == "admin") {
          setRedirectPath("/admin");
        } else {
          setRedirectPath("/me/test");
        }
      }
    };

    checkUserRole();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-200 min-h-screen flex flex-col items-center justify-center px-4">
      <img
        src="/404.png"
        alt="404 Page Not Found"
        className="w-[300px] md:w-[400px] lg:w-[400px] animate-fadeIn opacity-75"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-blue-600 text-center mt-8">
        404 - Page Not Found
      </h1>

      <p className="md:text-lg text-gray-600 text-center mt-4 max-w-lg">
        Oops! The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to={redirectPath}
        className="mt-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold md:text-xl transition hover:underline"
      >
        <ArrowLeftCircle className="w-6 h-6" />
        Back to Home
      </Link>
    </div>
  );
};

export default ErrorPage;
