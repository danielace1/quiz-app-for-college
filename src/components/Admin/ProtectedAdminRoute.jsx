import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const ProtectedAdminRoute = ({ children }) => {
  const { user, authLoading } = useAuthStore();

  if (authLoading) return null;
  return user && user.role === "admin" ? children : <Navigate to="/login" />;
};

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedAdminRoute;
