import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./Pages/Login.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import QuizManagement from "./Pages/QuizManagement.jsx";
import UserSubmissions from "./Pages/UserSubmissions.jsx";
import Layout from "./Pages/Layout.jsx";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "questions",
            element: <QuizManagement />,
          },
          {
            path: "users",
            element: <UserSubmissions />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={route} />
);
