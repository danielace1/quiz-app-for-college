import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import GuestLayout from "./Layout/GuestLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import useAuthStore from "./store/useAuthStore";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ErrorPage from "./ErrorPage/Error";

// User
import DashboardLayout from "./Pages/DashboardLayout";
import Test from "./Pages/Test";
import Leaderboard from "./Pages/Leaderboard";
import History from "./Pages/History";
import Profile from "./Pages/Profile";

// Admin
import ProtectedAdminRoute from "./components/Admin/ProtectedAdminRoute";
import AdminDashboardLayout from "./Pages/Admin/AdminDashboardLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ManageTests from "./Pages/Admin/ManageTests";

const App = () => {
  const initAuth = useAuthStore((state) => state.initAuth);
  const authLoading = useAuthStore((state) => state.authLoading);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!authLoading && user) {
      if (
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/signup"
      ) {
        const isAdmin = user?.role === "admin";
        navigate(isAdmin ? "/admin" : "/me");
      }
    }
  }, [authLoading, user, navigate, location]);

  if (authLoading) return <Loader />;

  return (
    <>
      <Routes>
        <Route path="/" element={<GuestLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User */}
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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tests" element={<ManageTests />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
