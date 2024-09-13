import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import GuestLayout from "./Layout/GuestLayout.jsx";
import SignupAndLogin from "./Pages/Login.jsx";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <GuestLayout />,
      },
      {
        path: "/signup&login",
        element: <SignupAndLogin />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={route} />
);
