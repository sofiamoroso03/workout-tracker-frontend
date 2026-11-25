import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function decodeTokenPayload(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const decoded = new TextDecoder().decode(bytes);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem("auth_token");
        return savedToken ? decodeTokenPayload(savedToken) : null;
    });

    function login(newToken, userData = null) {
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
        setUser(userData || decodeTokenPayload(newToken));
    }

    function logout() {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: Boolean(token),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}