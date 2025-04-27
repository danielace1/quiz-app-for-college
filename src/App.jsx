import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import GuestLayout from "./Layout/GuestLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ErrorPage from "./ErrorPage/Error";
import DashboardLayout from "./Pages/DashboardLayout";
import Test from "./Pages/Test";
import Leaderboard from "./Pages/Leaderboard";
import History from "./Pages/History";
import Profile from "./Pages/Profile";

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
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="test" element={<Test />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="history" element={<History />} />
          <Route path="" element={<Profile />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
