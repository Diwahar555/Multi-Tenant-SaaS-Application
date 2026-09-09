import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
function Navbar() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <nav className="navbar">

            {/* =========================
                LOGO
            ========================= */}

            <div className="navbar-left">

                <h2>
                    Multi-Tenant SaaS
                </h2>

            </div>


            {/* =========================
                USER AREA
            ========================= */}

            <div className="navbar-right">

                <div className="navbar-user">

                    {/* Username */}

                    <span className="navbar-username">
                        {user?.username || "User"}
                    </span>


                    {/* Role */}

                    <small className="navbar-role">
                        {user?.role || ""}
                    </small>


                    {/* Company */}

                    <span className="navbar-company">
                        {user?.tenant || "Company"}
                    </span>

                </div>


                {/* Logout */}

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;