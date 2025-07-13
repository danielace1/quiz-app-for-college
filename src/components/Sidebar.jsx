import PropTypes from "prop-types";
import {
  Brain,
  ClipboardList,
  Trophy,
  History,
  UserCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: ClipboardList, label: "Attempt Test", path: "/me/test" },
  { icon: Trophy, label: "Leaderboard", path: "/me/leaderboard" },
  { icon: History, label: "History", path: "/me/history" },
  { icon: UserCircle, label: "Profile", path: "/me/profile" },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 bg-white border-r border-gray-200`}
    >
      <div className="h-full mt-2 px-3 md:px-5 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <Link to={"/me/test"}>
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl md:text-2xl font-bold text-gray-800">
                Quiz Craze
              </span>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg lg:hidden hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center py-3 px-2 md:px-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group ${
                  location.pathname === item.path
                    ? "bg-amber-50 font-semibold"
                    : ""
                }`}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-yellow-500" />
                <span className="ml-3 flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
