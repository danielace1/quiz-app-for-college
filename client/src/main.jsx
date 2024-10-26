import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import GuestLayout from "./Layout/GuestLayout.jsx";
import SignupAndLogin from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import ErrorPage from "./ErrorPage/Error.jsx";
import Final from "./Pages/Final.jsx";

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
        path: "/signup-login",
        element: <SignupAndLogin />,
      },
      {
        path: "/student/:id",
        element: <Home />,
      },
      {
        path: "/student/:id/final",
        element: <Final />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={route} />
);
