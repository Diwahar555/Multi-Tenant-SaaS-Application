import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // GET CURRENT USER
    // =========================

    const refreshUser = async () => {

        try {

            const token =
                localStorage.getItem(
                    "access_token"
                );

            if (!token) {

                setUser(null);

                return;
            }

            const response =
                await api.get(
                    "/auth/me/"
                );

            console.log(
                "Current user:",
                response.data
            );

            setUser(
                response.data
            );

        } catch (error) {

            console.error(
                "Auth user error:",
                error
            );

            setUser(null);

        }
    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        setUser(null);
    };


    // =========================
    // INITIAL AUTH CHECK
    // =========================

    useEffect(() => {

        const initializeAuth =
            async () => {

                await refreshUser();

                setLoading(false);
            };

        initializeAuth();

    }, []);


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


// =========================
// USE AUTH
// =========================

export function useAuth() {

    return useContext(
        AuthContext
    );
}