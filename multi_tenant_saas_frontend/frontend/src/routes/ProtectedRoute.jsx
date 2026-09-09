import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
    children,
    allowedRoles,
}) {
    const { user, loading } = useAuth();

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    // =========================
    // NOT LOGGED IN
    // =========================

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // =========================
    // NO ROLE RESTRICTION
    // =========================

    if (
        !allowedRoles ||
        allowedRoles.length === 0
    ) {
        return children;
    }

    // =========================
    // ROLE CHECK
    // =========================

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }
    // =========================
    // ACCESS GRANTED
    // =========================

    return children;
}

export default ProtectedRoute;