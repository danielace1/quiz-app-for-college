import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <nav className="bg-orange-400 p-5 min-h-screen w-1/6 fixed">
      <h1 className="text-white font-bold text-xl mb-1">Java Quiz App! 🚀</h1>

      <ul className="mt-5 space-y-2.5">
        <NavLink to={"/dashboard"}>
          <li className="text-white font-semibold text-lg hover:cursor-pointer hover:bg-orange-300 hover:rounded-lg hover:pl-2 hover:py-1 transition-all hover:transition-all">
            Dashboard
          </li>
        </NavLink>
        <NavLink to={"/questions"}>
          <li className="text-white font-semibold text-lg hover:cursor-pointer hover:bg-orange-300 hover:rounded-lg hover:pl-2 hover:py-1 transition-all hover:transition-all">
            Quiz Management
          </li>
        </NavLink>
        <NavLink to="/users">
          <li className="text-white font-semibold text-lg hover:cursor-pointer hover:bg-orange-300 hover:rounded-lg hover:pl-2 hover:py-1 transition-all hover:transition-all">
            User Submissions
          </li>
        </NavLink>
      </ul>

      <div className="absolute bottom-3">
        <button className="flex items-center justify-center bg-white text-orange-500 rounded-md px-4 py-2 font-semibold hover:bg-gray-100 text-lg">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="currentColor"
                d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h6q.425 0 .713.288T12 20t-.288.713T11 21zm12.175-8H10q-.425 0-.712-.288T9 12t.288-.712T10 11h7.175L15.3 9.125q-.275-.275-.275-.675t.275-.7t.7-.313t.725.288L20.3 11.3q.3.3.3.7t-.3.7l-3.575 3.575q-.3.3-.712.288t-.713-.313q-.275-.3-.262-.712t.287-.688z"
              ></path>
            </svg>
          </span>
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
