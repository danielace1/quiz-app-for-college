import PropTypes from "prop-types";
import { Menu, X, LogOut } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
              <span className="md:hidden text-gray-600">
                Welcome,{" "}
                <span className="capitalize text-yellow-500 font-semibold">
                  {user?.username} !
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <div>
              <span className="hidden md:block text-gray-600">
                Welcome,{" "}
                <span className="capitalize text-yellow-500 font-semibold">
                  {user?.username} !
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

Navbar.propTypes = {
  toggleSidebar: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
  username: PropTypes.string,
};

export default Navbar;
