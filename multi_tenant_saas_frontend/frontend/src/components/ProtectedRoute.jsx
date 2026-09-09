import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
    children,
    allowedRoles,
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // If roles were provided,
    // check the user's role.
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;