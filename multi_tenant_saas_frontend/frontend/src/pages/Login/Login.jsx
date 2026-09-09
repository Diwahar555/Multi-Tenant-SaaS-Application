import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post(
                "/auth/login/",
                {
                    username,
                    password,
                }
            );

            console.log(
                "Login response:",
                response.data
            );

            const accessToken =
                response.data.access;

            const refreshToken =
                response.data.refresh;

            if (!accessToken) {
                setError(
                    "Login succeeded but no access token was returned."
                );

                return;
            }

            localStorage.setItem(
                "access_token",
                accessToken
            );

            if (refreshToken) {
                localStorage.setItem(
                    "refresh_token",
                    refreshToken
                );
            }

            await refreshUser();

            navigate("/dashboard");

        } catch (err) {
            console.error(
                "Login error:",
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
                    "Invalid username or password."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Login
                    </h1>

                    <p>
                        Sign in to your account.
                    </p>

                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label htmlFor="login-username">
                            Username
                        </label>

                        <input
                            id="login-username"
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

                    <div className="form-group">

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-button auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <div className="auth-footer">

                    <p>
                        Don't have an account?
                    </p>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={() =>
                            navigate("/signup")
                        }
                    >
                        Sign Up
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;