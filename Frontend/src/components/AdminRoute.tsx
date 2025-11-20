import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Spinner from "./ui/Spinner";

const AdminRoute = () => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
