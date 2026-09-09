import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function EditIncident() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("LOW");
    const [status, setStatus] = useState("OPEN");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // ROLE CHECK
    // =========================

    const canEdit =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    // =========================
    // LOAD INCIDENT
    // =========================

    useEffect(() => {
        if (!canEdit) {
            setLoading(false);
            return;
        }

        fetchIncident();
    }, [id, canEdit]);

    const fetchIncident = async () => {
        try {
            const response = await api.get(
                `/incidents/${id}/`
            );

            console.log(
                "Incident API response:",
                response.data
            );

            const incident = response.data;

            setTitle(
                incident.title || ""
            );

            setDescription(
                incident.description || ""
            );

            setSeverity(
                incident.severity || "LOW"
            );

            setStatus(
                incident.status || "OPEN"
            );

        } catch (err) {
            console.error(
                "Fetch incident error:",
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
                    "You do not have permission to view this incident."
                );

            } else if (
                err.response?.status === 404
            ) {
                setError(
                    "Incident not found."
                );

            } else {
                setError(
                    "Unable to load incident."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UPDATE INCIDENT
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            await api.patch(
                `/incidents/${id}/`,
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
                "Update incident error:",
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
                    "You do not have permission to edit this incident."
                );

            } else if (
                err.response?.status === 404
            ) {
                setError(
                    "Incident not found."
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
                    "Unable to update incident."
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
            <div className="form-page">

                <div className="form-page-header">

                    <h1>
                        Loading Incident...
                    </h1>

                    <p>
                        Please wait while the incident is loaded.
                    </p>

                </div>

            </div>
        );
    }

    // =========================
    // ROLE PROTECTION
    // =========================

    if (!canEdit) {
        return (
            <div className="form-page">

                <div className="form-error">
                    You do not have permission
                    to edit incidents.
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
    // PAGE
    // =========================

    return (
        <div className="form-page">

            {/* Header */}

            <div className="form-page-header">

                <h1>
                    Edit Incident
                </h1>

                <p>
                    Update incident information.
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


                    {/* Actions */}

                    <div className="form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            disabled={saving}
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

export default EditIncident;