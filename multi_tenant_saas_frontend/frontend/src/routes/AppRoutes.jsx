import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "../pages/Login/Login";
import Signup from "../pages/Auth/Signup";

import Dashboard from "../pages/Dashboard/Dashboard";

import Incidents from "../pages/Incidents/Incidents";
import CreateIncident from "../pages/Incidents/CreateIncident";
import EditIncident from "../pages/Incidents/EditIncident";

import Users from "../pages/Users/Users";
import CreateUser from "../pages/Users/CreateUser";
import EditUser from "../pages/Users/EditUser";

import Profile from "../pages/Profile/Profile";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";


function AppRoutes() {

    return (

        <Routes>

            {/* =========================
                DEFAULT
            ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* =========================
                PUBLIC
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/signup"
                element={<Signup />}
            />


            {/* =========================
                DASHBOARD
                ADMIN + MANAGER + MEMBER
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>

                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                INCIDENTS
                ADMIN + MANAGER + MEMBER
            ========================= */}

            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>

                        <DashboardLayout>
                            <Incidents />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                CREATE INCIDENT
                ADMIN + MANAGER
            ========================= */}

            <Route
                path="/incidents/create"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "ADMIN",
                            "MANAGER",
                        ]}
                    >

                        <DashboardLayout>
                            <CreateIncident />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                EDIT INCIDENT
                ADMIN + MANAGER
            ========================= */}

            <Route
                path="/incidents/:id/edit"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "ADMIN",
                            "MANAGER",
                        ]}
                    >

                        <DashboardLayout>
                            <EditIncident />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                USERS
                ADMIN + MANAGER
            ========================= */}

            <Route
                path="/users"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "ADMIN",
                            "MANAGER",
                        ]}
                    >

                        <DashboardLayout>
                            <Users />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                CREATE USER
                ADMIN ONLY
            ========================= */}

            <Route
                path="/users/create"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "ADMIN",
                        ]}
                    >

                        <DashboardLayout>
                            <CreateUser />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                EDIT USER
                ADMIN ONLY
            ========================= */}

            <Route
                path="/users/:id/edit"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "ADMIN",
                        ]}
                    >

                        <DashboardLayout>
                            <EditUser />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                PROFILE
                ALL AUTHENTICATED USERS
            ========================= */}

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>

                        <DashboardLayout>
                            <Profile />
                        </DashboardLayout>

                    </ProtectedRoute>
                }
            />


            {/* =========================
                UNKNOWN URL
            ========================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>

    );
}

export default AppRoutes;