import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("MEMBER");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // ADMIN CHECK
    // =========================

    const isAdmin =
        user?.role === "ADMIN";

    // =========================
    // LOAD USER
    // =========================

    useEffect(() => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        fetchUser();
    }, [id, isAdmin]);

    const fetchUser = async () => {
        try {
            const response = await api.get(
                `/users/${id}/`
            );

            console.log(
                "User API response:",
                response.data
            );

            const userData = response.data;

            setUsername(
                userData.username || ""
            );

            setEmail(
                userData.email || ""
            );

            setPhone(
                userData.phone || ""
            );

            setRole(
                userData.role || "MEMBER"
            );

        } catch (err) {
            console.error(
                "Fetch user error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to view this user."
                );

            } else if (
                err.response?.status === 404
            ) {
                setError(
                    "User not found."
                );

            } else {
                setError(
                    "Unable to load user."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UPDATE USER
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            await api.patch(
                `/users/${id}/`,
                {
                    username,
                    email,
                    phone,
                    role,
                }
            );

            navigate("/users");

        } catch (err) {
            console.error(
                "Update user error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            if (
                err.response?.status === 403
            ) {
                setError(
                    "You do not have permission to edit this user."
                );

            } else if (
                err.response?.status === 404
            ) {
                setError(
                    "User not found."
                );

            } else if (
                err.response?.data
            ) {
                setError(
                    JSON.stringify(
                        err.response.data,
                        null,
                        2
                    )
                );

            } else {
                setError(
                    "Unable to update user."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="users-page">

                <h1>
                    Loading user...
                </h1>

            </div>
        );
    }

    // =========================
    // ROLE PROTECTION
    // =========================

    if (!isAdmin) {
        return (
            <div className="users-page">

                <div className="users-error">

                    You do not have permission
                    to edit users.

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/users")
                    }
                >
                    Back to Users
                </button>

            </div>
        );
    }

    // =========================
    // LOAD ERROR
    // =========================

    if (error && !username) {
        return (
            <div className="users-page">

                <div className="users-error">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/users")
                    }
                >
                    Back to Users
                </button>

            </div>
        );
    }

    // =========================
    // PAGE
    // =========================

    return (
        <div className="users-page">

            {/* Header */}

            <div className="users-header">

                <div>

                    <h1>
                        Edit User
                    </h1>

                    <p>
                        Update user information.
                    </p>

                </div>

            </div>


            {/* Error */}

            {error && (
                <div className="users-error">
                    {error}
                </div>
            )}


            {/* Form */}

            <div className="users-card">

                <form
                    onSubmit={handleSubmit}
                    className="user-form"
                >

                    {/* Username */}

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            autoComplete="username"
                            required
                        />

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* Phone */}

                    <div className="form-group">

                        <label htmlFor="phone">
                            Phone
                        </label>

                        <input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={(event) =>
                                setPhone(
                                    event.target.value
                                )
                            }
                            autoComplete="tel"
                        />

                    </div>


                    {/* Role */}

                    <div className="form-group">

                        <label htmlFor="role">
                            Role
                        </label>

                        <select
                            id="role"
                            value={role}
                            onChange={(event) =>
                                setRole(
                                    event.target.value
                                )
                            }
                        >

                            <option value="MEMBER">
                                MEMBER
                            </option>

                            <option value="MANAGER">
                                MANAGER
                            </option>

                            <option value="ADMIN">
                                ADMIN
                            </option>

                        </select>

                    </div>


                    {/* Buttons */}

                    <div className="form-actions">

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                navigate("/users")
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditUser;