import { Menu, X, Brain, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const Navbar = ({ toggleSidebar, isSidebarOpen, username }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  console.log("User in Navbar:", user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center ml-2 lg:hidden">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                Quiz Craze
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600">
              Welcome back, {username}!
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
