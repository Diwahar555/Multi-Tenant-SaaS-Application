import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

import "./Incidents.css";

function Incidents() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // ROLE PERMISSIONS
    // =========================

    const canCreateIncident =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    const canEditIncident =
        user?.role === "ADMIN" ||
        user?.role === "MANAGER";

    const canDeleteIncident =
        user?.role === "ADMIN";

    // =========================
    // LOAD INCIDENTS
    // =========================

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await api.get(
                "/incidents/"
            );

            console.log(
                "Incidents API response:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setIncidents(response.data);

            } else if (
                Array.isArray(
                    response.data.results
                )
            ) {
                setIncidents(
                    response.data.results
                );

            } else {
                setIncidents([]);

                setError(
                    "Unexpected incidents API response."
                );
            }

        } catch (err) {
            console.error(
                "Incidents API error:",
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
                    "You do not have permission to view incidents."
                );

            } else {
                setError(
                    "Unable to load incidents."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE INCIDENT
    // =========================

    const handleDelete = async (id) => {

        if (!canDeleteIncident) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this incident?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/incidents/${id}/`
            );

            setIncidents(
                (currentIncidents) =>
                    currentIncidents.filter(
                        (incident) =>
                            incident.id !== id
                    )
            );

        } catch (err) {
            console.error(
                "Delete incident error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            if (
                err.response?.status === 403
            ) {
                alert(
                    "You do not have permission to delete this incident."
                );

            } else {
                alert(
                    "Unable to delete incident."
                );
            }
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="incidents-page">

                <div className="incidents-loading">
                    Loading incidents...
                </div>

            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="incidents-page">

                <div className="incidents-error">
                    {error}
                </div>

            </div>
        );
    }

    // =========================
    // PAGE
    // =========================

    return (
        <div className="incidents-page">

            {/* Header */}

            <div className="incidents-header">

                <div>

                    <h1>
                        Incidents
                    </h1>

                    <p>
                        Manage incidents for your organization.
                    </p>

                </div>


                {/* Create */}

                {canCreateIncident && (
                    <button
                        type="button"
                        className="create-incident-button"
                        onClick={() =>
                            navigate(
                                "/incidents/create"
                            )
                        }
                    >
                        + Create Incident
                    </button>
                )}

            </div>


            {/* Incidents Card */}

            <div className="incidents-card">

                {incidents.length === 0 ? (

                    <div className="empty-state">

                        <h2>
                            No incidents found
                        </h2>

                        <p>
                            {canCreateIncident
                                ? "Create your first incident to get started."
                                : "There are currently no incidents in your organization."
                            }
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="incidents-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Incident
                                    </th>

                                    <th>
                                        Severity
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created By
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {incidents.map(
                                    (incident) => (

                                        <tr
                                            key={
                                                incident.id
                                            }
                                        >

                                            {/* ID */}

                                            <td>
                                                #
                                                {
                                                    incident.id
                                                }
                                            </td>


                                            {/* INCIDENT */}

                                            <td>

                                                <div className="incident-title">
                                                    {
                                                        incident.title ||
                                                        "Untitled Incident"
                                                    }
                                                </div>

                                                <div className="incident-description">
                                                    {
                                                        incident.description ||
                                                        "No description"
                                                    }
                                                </div>

                                            </td>


                                            {/* SEVERITY */}

                                            <td>

                                                <span
                                                    className={`badge severity-${(
                                                        incident.severity ||
                                                        ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {
                                                        incident.severity ||
                                                        "UNKNOWN"
                                                    }
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`badge status-${(
                                                        incident.status ||
                                                        ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {(
                                                        incident.status ||
                                                        "UNKNOWN"
                                                    ).replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>

                                            </td>


                                            {/* CREATED BY */}

                                            <td>

                                                {typeof incident.created_by ===
                                                "object"
                                                    ? incident
                                                          .created_by
                                                          ?.username ||
                                                      "Unknown"
                                                    : incident.created_by
                                                    ? `User #${incident.created_by}`
                                                    : "Unknown"}

                                            </td>


                                            {/* CREATED */}

                                            <td>

                                                {incident.created_at
                                                    ? new Date(
                                                          incident.created_at
                                                      ).toLocaleDateString()
                                                    : "—"}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="action-buttons">

                                                    {/* EDIT */}

                                                    {canEditIncident && (
                                                        <button
                                                            type="button"
                                                            className="edit-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/incidents/${incident.id}/edit`
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                    )}


                                                    {/* DELETE */}

                                                    {canDeleteIncident && (
                                                        <button
                                                            type="button"
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    incident.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Incidents;