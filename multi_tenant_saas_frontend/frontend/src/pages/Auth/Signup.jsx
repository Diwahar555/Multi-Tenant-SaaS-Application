import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

function Signup() {
    const navigate = useNavigate();

    const [companyName, setCompanyName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/register/",
                {
                    company_name: companyName,
                    username,
                    email,
                    phone,
                    password,
                }
            );

            console.log(
                "Signup response:",
                response.data
            );

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            console.error(
                "Signup error:",
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
                    "Unable to create account."
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
                        Create Account
                    </h1>

                    <p>
                        Create your organization account.
                    </p>

                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="form-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Company Name */}

                    <div className="form-group">

                        <label htmlFor="company-name">
                            Company Name
                        </label>

                        <input
                            id="company-name"
                            type="text"
                            value={companyName}
                            onChange={(event) =>
                                setCompanyName(
                                    event.target.value
                                )
                            }
                            placeholder="Enter company name"
                            autoComplete="organization"
                            required
                        />

                    </div>

                    {/* Username */}

                    <div className="form-group">

                        <label htmlFor="signup-username">
                            Username
                        </label>

                        <input
                            id="signup-username"
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

                        <label htmlFor="signup-email">
                            Email
                        </label>

                        <input
                            id="signup-email"
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

                        <label htmlFor="signup-phone">
                            Phone
                        </label>

                        <input
                            id="signup-phone"
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

                        <label htmlFor="signup-password">
                            Password
                        </label>

                        <input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Create password"
                            autoComplete="new-password"
                            required
                        />

                    </div>

                    {/* Confirm Password */}

                    <div className="form-group">

                        <label htmlFor="signup-confirm-password">
                            Confirm Password
                        </label>

                        <input
                            id="signup-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            required
                        />

                    </div>

                    {/* Submit */}

                    <button
                        type="submit"
                        className="primary-button auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Sign Up"}
                    </button>

                </form>

                <div className="auth-footer">

                    <p>
                        Already have an account?
                    </p>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Signup;