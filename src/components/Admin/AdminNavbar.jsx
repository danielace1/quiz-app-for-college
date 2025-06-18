import PropTypes from "prop-types";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const AdminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 lg:pl-60">
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
            <div className="flex items-center ml-2">
              <Shield className="h-5 w-5 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-blue-600">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-x-3">
            <div>
              <span className="text-sm text-gray-600 hidden md:block">
                🛡️ Hello,{" "}
                <span className="capitalize text-blue-600 font-semibold">
                  {user?.username}!
                </span>
              </span>
            </div>
            <div>
              <button
                onClick={() => logout({ navigate })}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

AdminNavbar.propTypes = {
  toggleSidebar: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default AdminNavbar;
