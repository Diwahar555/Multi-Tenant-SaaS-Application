import { useEffect, useState } from "react";

import api from "../../api/axios";

import "./Dashboard.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get(
                "/dashboard/"
            );

            console.log(
                "Dashboard API response:",
                response.data
            );

            setDashboard(response.data);

        } catch (err) {
            console.error(
                "Dashboard API error:",
                err
            );

            console.log(
                "Django response:",
                err.response?.data
            );

            setError(
                "Unable to load dashboard."
            );

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">

                <div className="dashboard-loading">
                    Loading Dashboard...
                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">

                <div className="dashboard-error">
                    {error}
                </div>

            </div>
        );
    }

    const recentIncidents =
        Array.isArray(
            dashboard?.recent_incidents
        )
            ? dashboard.recent_incidents
            : [];

    return (
        <div className="dashboard-page">

            {/* Header */}

            <div className="dashboard-header">

                <div>
                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Overview of your
                        organization's security
                        incidents.
                    </p>
                </div>

            </div>


            {/* Statistics */}

            <div className="dashboard-cards">

                {/* Total */}

                <div className="dashboard-card">

                    <span className="card-label">
                        Total Incidents
                    </span>

                    <strong className="card-value">
                        {
                            dashboard?.total_incidents ??
                            0
                        }
                    </strong>

                </div>


                {/* Open */}

                <div className="dashboard-card">

                    <span className="card-label">
                        Open
                    </span>

                    <strong className="card-value">
                        {
                            dashboard?.open_incidents ??
                            0
                        }
                    </strong>

                </div>


                {/* In Progress */}

                <div className="dashboard-card">

                    <span className="card-label">
                        In Progress
                    </span>

                    <strong className="card-value">
                        {
                            dashboard?.in_progress_incidents ??
                            0
                        }
                    </strong>

                </div>


                {/* Critical */}

                <div className="dashboard-card">

                    <span className="card-label">
                        Critical
                    </span>

                    <strong className="card-value">
                        {
                            dashboard?.critical_incidents ??
                            0
                        }
                    </strong>

                </div>

            </div>


            {/* Recent Incidents */}

            {recentIncidents.length > 0 && (

                <div className="recent-incidents-card">

                    <div className="recent-incidents-header">

                        <div>
                            <h2>
                                Recent Incidents
                            </h2>

                            <p>
                                Latest security
                                incidents in your
                                organization.
                            </p>
                        </div>

                    </div>


                    <div className="recent-incidents-list">

                        {recentIncidents.map(
                            (incident) => (

                                <div
                                    className="recent-incident"
                                    key={
                                        incident.id
                                    }
                                >

                                    <div>

                                        <h3>
                                            {
                                                incident.title
                                            }
                                        </h3>

                                        <p>
                                            {
                                                incident.description
                                            }
                                        </p>

                                    </div>


                                    <div className="recent-incident-meta">

                                        {incident.severity && (
                                            <span
                                                className={`badge severity-${incident.severity.toLowerCase()}`}
                                            >
                                                {
                                                    incident.severity
                                                }
                                            </span>
                                        )}

                                        {incident.status && (
                                            <span
                                                className={`badge status-${incident.status.toLowerCase()}`}
                                            >
                                                {incident.status.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default Dashboard;