import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import GuestLayout from "./Layout/GuestLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Final from "./Pages/Final";
import ErrorPage from "./ErrorPage/Error";

const App = () => {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Routes>
        <Route path="/" element={<GuestLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/me"
          element={
            <ProtectedRoute>
              {/* <Navbar /> */}
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/:id"
          element={
            <>
              <Navbar />
              <Final />
            </>
          }
        />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
