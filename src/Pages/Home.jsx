import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Brain,
  ClipboardList,
  Trophy,
  History,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    { icon: ClipboardList, label: "Attempt Test", path: "/test" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: History, label: "History", path: "/history" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  Quiz Craze
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm text-gray-600">
                Welcome back, User!
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

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 bg-white border-r border-gray-200`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.path}
                  className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 group"
                >
                  <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                  <span className="ml-3 flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 pt-16">
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
