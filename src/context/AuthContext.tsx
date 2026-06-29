"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();

    useEffect(() => {
        setLoading(true)
        const storedToken = localStorage.getItem("token");
        setTokenState(storedToken);
        if (!storedToken) {
            logout()
        }
        setTimeout(() => {
            setLoading(false)
        }, 500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setToken = (token: string | null) => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
        setTokenState(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setTokenState(null);
        router.push("/signin");
    };

    return (
        <AuthContext.Provider value={{ token, setToken, logout }}>
            {loading ? <div>loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
