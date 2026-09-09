import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default RoleProtectedRoute;