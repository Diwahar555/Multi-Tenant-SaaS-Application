import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { user } = useAuth();

    const role = user?.role;

    return (
        <aside className="sidebar">

            <div className="sidebar-title">
                MENU
            </div>

            <nav>

                {/* Dashboard */}

                <NavLink
                    to="/dashboard"
                    end
                >
                    Dashboard
                </NavLink>


                {/* Incidents */}

                <NavLink
                    to="/incidents"
                    end
                >
                    Incidents
                </NavLink>


                {/* Create Incident
                    ADMIN + MANAGER
                */}

                {(role === "ADMIN" ||
                    role === "MANAGER") && (

                    <NavLink
                        to="/incidents/create"
                        end
                    >
                        Create Incident
                    </NavLink>

                )}


                {/* Users
                    ADMIN + MANAGER
                */}

                {(role === "ADMIN" ||
                    role === "MANAGER") && (

                    <NavLink
                        to="/users"
                        end
                    >
                        Users
                    </NavLink>

                )}


                {/* Profile */}

                <NavLink
                    to="/profile"
                    end
                >
                    Profile
                </NavLink>

            </nav>

        </aside>
    );
}

export default Sidebar;