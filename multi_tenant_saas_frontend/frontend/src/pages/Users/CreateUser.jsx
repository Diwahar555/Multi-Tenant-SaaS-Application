import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function CreateUser() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("MEMBER");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // ADMIN CHECK
    // =========================

    if (user?.role !== "ADMIN") {
        return (
            <div className="form-page">

                <div className="form-error">
                    You do not have permission to create users.
                </div>

                <div className="form-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/users")}
                    >
                        Back to Users
                    </button>

                </div>

            </div>
        );
    }

    // =========================
    // CREATE USER
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            await api.post(
                "/users/",
                {
                    username: username.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password,
                    role,
                }
            );

            navigate("/users");

        } catch (err) {
            console.error(
                "Create user error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            if (err.response?.data) {
                setError(
                    JSON.stringify(
                        err.response.data,
                        null,
                        2
                    )
                );
            } else {
                setError(
                    "Unable to create user."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // PAGE
    // =========================

    return (
        <div className="form-page">

            <div className="form-page-header">

                <h1>
                    Create User
                </h1>

                <p>
                    Create a new user for your organization.
                </p>

            </div>


            {/* Error */}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            {/* Form */}

            <div className="form-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

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
                                placeholder="Enter username"
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
                                placeholder="Enter email"
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
                                placeholder="Enter phone number"
                                autoComplete="tel"
                            />

                        </div>


                        {/* Password */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <small>
                                Password must be at least 8 characters.
                            </small>

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

                    </div>


                    {/* Buttons */}

                    <div className="form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create User"}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/users")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default CreateUser;