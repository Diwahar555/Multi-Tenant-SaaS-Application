import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

import "./Users.css";

function Users() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // PERMISSIONS
    // =========================

    const canCreateUser =
        user?.role === "ADMIN";

    const canEditUser =
        user?.role === "ADMIN";

    const canDeleteUser =
        user?.role === "ADMIN";

    // =========================
    // LOAD USERS
    // =========================

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get(
                "/users/"
            );

            console.log(
                "Users API response:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setUsers(response.data);

            } else if (
                Array.isArray(
                    response.data.results
                )
            ) {
                setUsers(
                    response.data.results
                );

            } else {
                setUsers([]);

                setError(
                    "Unexpected users API response."
                );
            }

        } catch (err) {
            console.error(
                "Users API error:",
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
                    "You do not have permission to view users."
                );

            } else {
                setError(
                    "Unable to load users."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE USER
    // =========================

    const handleDelete = async (userId) => {

        if (!canDeleteUser) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/users/${userId}/`
            );

            setUsers(
                (currentUsers) =>
                    currentUsers.filter(
                        (item) =>
                            item.id !== userId
                    )
            );

        } catch (err) {
            console.error(
                "Delete user error:",
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
                    "You do not have permission to delete this user."
                );

            } else {
                alert(
                    "Unable to delete user."
                );
            }
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="users-page">
                <h1>
                    Loading users...
                </h1>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="users-page">

                <div className="users-error">
                    {error}
                </div>

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
                        Users
                    </h1>

                    <p>
                        Manage users in your organization.
                    </p>

                </div>


                {/* Create User */}

                {canCreateUser && (
                    <button
                        type="button"
                        className="create-user-button"
                        onClick={() =>
                            navigate(
                                "/users/create"
                            )
                        }
                    >
                        + Create User
                    </button>
                )}

            </div>


            {/* Users Card */}

            <div className="users-card">

                {users.length === 0 ? (

                    <div className="empty-users">

                        <h2>
                            No users found
                        </h2>

                        <p>
                            No users are available
                            in your organization.
                        </p>

                    </div>

                ) : (

                    <div className="users-table-wrapper">

                        <table className="users-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Username
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Email Verified
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {users.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            {/* ID */}

                                            <td>
                                                #
                                                {
                                                    item.id
                                                }
                                            </td>


                                            {/* Username */}

                                            <td>
                                                <strong>
                                                    {
                                                        item.username
                                                    }
                                                </strong>
                                            </td>


                                            {/* Email */}

                                            <td>
                                                {
                                                    item.email ||
                                                    "—"
                                                }
                                            </td>


                                            {/* Phone */}

                                            <td>
                                                {
                                                    item.phone ||
                                                    "—"
                                                }
                                            </td>


                                            {/* Role */}

                                            <td>

                                                <span className="role-badge">
                                                    {
                                                        item.role
                                                    }
                                                </span>

                                            </td>


                                            {/* Email Verified */}

                                            <td>
                                                {
                                                    item.email_verified
                                                        ? "Yes"
                                                        : "No"
                                                }
                                            </td>


                                            {/* Actions */}

                                            <td className="user-actions">

                                                {/* Edit */}

                                                {canEditUser && (
                                                    <button
                                                        type="button"
                                                        className="edit-user-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/users/${item.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                )}


                                                {/* Delete */}

                                                {canDeleteUser && (
                                                    <button
                                                        type="button"
                                                        className="delete-user-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                )}

                                                {/* Manager */}

                                                {!canEditUser &&
                                                    !canDeleteUser && (
                                                        <span className="no-actions">
                                                            View only
                                                        </span>
                                                    )}

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

export default Users;