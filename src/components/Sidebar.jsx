import {
  Brain,
  ClipboardList,
  Trophy,
  History,
  UserCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: ClipboardList, label: "Attempt Test", path: "/test" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: History, label: "History", path: "/history" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 bg-white border-r border-gray-200`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 px-3">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">
              Quiz Craze
            </span>
          </div>
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
                className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 group"
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
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

export default Sidebar;
