import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

import "./Profile.css";

function Profile() {
    const { refreshUser, user } = useAuth();

    // =========================
    // PROFILE
    // =========================

    const [profile, setProfile] = useState(null);

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // =========================
    // PROFILE LOADING
    // =========================

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // PASSWORD
    // =========================

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [passwordSaving, setPasswordSaving] =
        useState(false);

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    // =========================
    // LOAD PROFILE
    // =========================

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get(
                "/auth/me/"
            );

            console.log(
                "Profile API response:",
                response.data
            );

            setProfile(response.data);

            setEmail(
                response.data.email || ""
            );

            setPhone(
                response.data.phone || ""
            );

        } catch (err) {
            console.error(
                "Profile API error:",
                err
            );

            console.log(
                "Django response:",
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
            );

            setError(
                "Unable to load profile."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UPDATE PROFILE
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.patch(
                "/auth/me/",
                {
                    email: email.trim(),
                    phone: phone.trim(),
                }
            );

            console.log(
                "Profile update response:",
                response.data
            );

            setProfile(response.data);

            setEmail(
                response.data.email || ""
            );

            setPhone(
                response.data.phone || ""
            );

            await refreshUser();

            setSuccess(
                "Profile updated successfully."
            );

        } catch (err) {
            console.error(
                "Profile update error:",
                err
            );

            console.log(
                "Django response:",
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
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
                    "Unable to update profile."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // =========================
    // CHANGE PASSWORD
    // =========================

    const handlePasswordChange = async (
        event
    ) => {
        event.preventDefault();

        setPasswordSaving(true);
        setPasswordError("");
        setPasswordSuccess("");

        // -------------------------
        // Validate current password
        // -------------------------

        if (!currentPassword.trim()) {
            setPasswordError(
                "Please enter your current password."
            );

            setPasswordSaving(false);

            return;
        }

        // -------------------------
        // Validate new password
        // -------------------------

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must be at least 8 characters."
            );

            setPasswordSaving(false);

            return;
        }

        // -------------------------
        // Confirm password
        // -------------------------

        if (
            newPassword !==
            confirmPassword
        ) {
            setPasswordError(
                "New passwords do not match."
            );

            setPasswordSaving(false);

            return;
        }

        // -------------------------
        // Prevent same password
        // -------------------------

        if (
            currentPassword ===
            newPassword
        ) {
            setPasswordError(
                "New password must be different from your current password."
            );

            setPasswordSaving(false);

            return;
        }

        try {
            const response = await api.post(
                "/auth/change-password/",
                {
                    current_password:
                        currentPassword,

                    new_password:
                        newPassword,

                    confirm_password:
                        confirmPassword,
                }
            );

            console.log(
                "Password change response:",
                response.data
            );

            // Clear fields

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setPasswordSuccess(
                "Password changed successfully."
            );

        } catch (err) {
            console.error(
                "Password change error:",
                err
            );

            console.log(
                "Django response:",
                JSON.stringify(
                    err.response?.data,
                    null,
                    2
                )
            );

            if (err.response?.data) {

                const responseData =
                    err.response.data;

                if (
                    responseData.current_password
                ) {
                    setPasswordError(
                        responseData.current_password.join
                            ? responseData.current_password.join(
                                  " "
                              )
                            : String(
                                  responseData.current_password
                              )
                    );

                } else if (
                    responseData.new_password
                ) {
                    setPasswordError(
                        responseData.new_password.join
                            ? responseData.new_password.join(
                                  " "
                              )
                            : String(
                                  responseData.new_password
                              )
                    );

                } else if (
                    responseData.confirm_password
                ) {
                    setPasswordError(
                        responseData.confirm_password.join
                            ? responseData.confirm_password.join(
                                  " "
                              )
                            : String(
                                  responseData.confirm_password
                              )
                    );

                } else if (
                    responseData.detail
                ) {
                    setPasswordError(
                        responseData.detail
                    );

                } else {
                    setPasswordError(
                        JSON.stringify(
                            responseData,
                            null,
                            2
                        )
                    );
                }

            } else {
                setPasswordError(
                    "Unable to change password."
                );
            }

        } finally {
            setPasswordSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="profile-page">

                <div className="profile-loading">
                    Loading profile...
                </div>

            </div>
        );
    }

    // =========================
    // PROFILE ERROR
    // =========================

    if (error && !profile) {
        return (
            <div className="profile-page">

                <div className="profile-error">
                    {error}
                </div>

            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (
        <div className="profile-page">

            {/* HEADER */}

            <div className="profile-header">

                <div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your account
                        information.
                    </p>

                </div>

            </div>


            {/* PROFILE SUMMARY */}

            <div className="profile-card">

                <div className="profile-avatar">

                    {profile?.username
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}

                </div>

                <div className="profile-main">

                    <h2>
                        {profile?.username ||
                            "User"}
                    </h2>

                    <span className="profile-role">

                        {profile?.role ||
                            "MEMBER"}

                    </span>

                </div>

            </div>


            {/* PROFILE MESSAGES */}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="profile-success">
                    {success}
                </div>
            )}


            {/* ACCOUNT INFORMATION */}

            <div className="profile-info-card">

                <div className="profile-section-header">

                    <h2>
                        Account Information
                    </h2>

                    <p>
                        Update your email
                        address and phone
                        number.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="profile-form"
                >

                    {/* Username */}

                    <div className="profile-field">

                        <label htmlFor="profile-username">
                            Username
                        </label>

                        <input
                            id="profile-username"
                            type="text"
                            value={
                                profile?.username ||
                                ""
                            }
                            autoComplete="username"
                            disabled
                        />

                    </div>


                    {/* Email */}

                    <div className="profile-field">

                        <label htmlFor="profile-email">
                            Email
                        </label>

                        <input
                            id="profile-email"
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

                    <div className="profile-field">

                        <label htmlFor="profile-phone">
                            Phone
                        </label>

                        <input
                            id="profile-phone"
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

                    <div className="profile-field">

                        <label htmlFor="profile-role">
                            Role
                        </label>

                        <input
                            id="profile-role"
                            type="text"
                            value={
                                profile?.role ||
                                ""
                            }
                            disabled
                        />

                    </div>


                    {/* Company */}

                    <div className="profile-field">

                        <label htmlFor="profile-company">
                            Company
                        </label>

                        <input
                            id="profile-company"
                            type="text"
                            value={
                                profile?.tenant ||
                                ""
                            }
                            disabled
                        />

                    </div>


                    {/* Email Verified */}

                    <div className="profile-field">

                        <label htmlFor="profile-verified">
                            Email Verified
                        </label>

                        <input
                            id="profile-verified"
                            type="text"
                            value={
                                profile?.email_verified
                                    ? "Yes"
                                    : "No"
                            }
                            disabled
                        />

                    </div>


                    {/* Save */}

                    <div className="profile-actions">

                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>


            {/* CHANGE PASSWORD */}

            <div className="profile-info-card">

                <div className="profile-section-header">

                    <h2>
                        Change Password
                    </h2>

                    <p>
                        Update your account
                        password.
                    </p>

                </div>


                {/* Password Error */}

                {passwordError && (
                    <div className="profile-error">
                        {passwordError}
                    </div>
                )}


                {/* Password Success */}

                {passwordSuccess && (
                    <div className="profile-success">
                        {passwordSuccess}
                    </div>
                )}


                <form
                    onSubmit={
                        handlePasswordChange
                    }
                    className="password-form"
                >

                    {/* Hidden Username */}

                    <input
                        type="text"
                        name="username"
                        value={
                            profile?.username ||
                            user?.username ||
                            ""
                        }
                        autoComplete="username"
                        tabIndex="-1"
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            left: "-9999px",
                            width: "1px",
                            height: "1px",
                        }}
                        readOnly
                    />


                    {/* Current Password */}

                    <div className="password-field">

                        <label htmlFor="current-password">
                            Current Password
                        </label>

                        <input
                            id="current-password"
                            name="current_password"
                            type="password"
                            value={
                                currentPassword
                            }
                            onChange={(event) =>
                                setCurrentPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your current password"
                            autoComplete="current-password"
                            required
                        />

                    </div>


                    {/* New Password */}

                    <div className="password-field">

                        <label htmlFor="new-password">
                            New Password
                        </label>

                        <input
                            id="new-password"
                            name="new_password"
                            type="password"
                            value={
                                newPassword
                            }
                            onChange={(event) =>
                                setNewPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />

                    </div>


                    {/* Confirm Password */}

                    <div className="password-field">

                        <label htmlFor="confirm-password">
                            Confirm New Password
                        </label>

                        <input
                            id="confirm-password"
                            name="confirm_password"
                            type="password"
                            value={
                                confirmPassword
                            }
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />

                    </div>


                    {/* Button */}

                    <div className="profile-actions">

                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={
                                passwordSaving
                            }
                        >
                            {passwordSaving
                                ? "Changing..."
                                : "Change Password"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default Profile;