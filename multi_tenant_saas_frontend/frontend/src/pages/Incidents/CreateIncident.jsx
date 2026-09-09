import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function CreateIncident() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("LOW");
    const [status, setStatus] = useState("OPEN");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // ROLE CHECK
    // =========================

    const canCreate =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    if (!canCreate) {
        return (
            <div className="form-page">

                <div className="form-error">
                    You do not have permission to create incidents.
                </div>

                <div className="form-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate("/incidents")
                        }
                    >
                        Back to Incidents
                    </button>

                </div>

            </div>
        );
    }

    // =========================
    // CREATE INCIDENT
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            await api.post(
                "/incidents/",
                {
                    title,
                    description,
                    severity,
                    status,
                }
            );

            navigate("/incidents");

        } catch (err) {
            console.error(
                "Create incident error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to create incidents."
                );

            } else if (err.response?.data) {
                setError(
                    JSON.stringify(
                        err.response.data,
                        null,
                        2
                    )
                );

            } else {
                setError(
                    "Unable to create incident."
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

            {/* Header */}

            <div className="form-page-header">

                <h1>
                    Create Incident
                </h1>

                <p>
                    Report a new incident for your organization.
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

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="form-grid">

                        {/* Title */}

                        <div className="form-group full-width">

                            <label htmlFor="incident-title">
                                Title
                            </label>

                            <input
                                id="incident-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter incident title"
                                required
                            />

                        </div>


                        {/* Description */}

                        <div className="form-group full-width">

                            <label htmlFor="incident-description">
                                Description
                            </label>

                            <textarea
                                id="incident-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe the incident"
                                rows="6"
                                required
                            />

                        </div>


                        {/* Severity */}

                        <div className="form-group">

                            <label htmlFor="incident-severity">
                                Severity
                            </label>

                            <select
                                id="incident-severity"
                                value={severity}
                                onChange={(event) =>
                                    setSeverity(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="LOW">
                                    LOW
                                </option>

                                <option value="MEDIUM">
                                    MEDIUM
                                </option>

                                <option value="HIGH">
                                    HIGH
                                </option>

                                <option value="CRITICAL">
                                    CRITICAL
                                </option>

                            </select>

                        </div>


                        {/* Status */}

                        <div className="form-group">

                            <label htmlFor="incident-status">
                                Status
                            </label>

                            <select
                                id="incident-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="OPEN">
                                    OPEN
                                </option>

                                <option value="IN_PROGRESS">
                                    IN PROGRESS
                                </option>

                                <option value="RESOLVED">
                                    RESOLVED
                                </option>

                                <option value="CLOSED">
                                    CLOSED
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
                                : "Create Incident"}
                        </button>


                        <button
                            type="button"
                            className="secondary-button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/incidents")
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

export default CreateIncident;