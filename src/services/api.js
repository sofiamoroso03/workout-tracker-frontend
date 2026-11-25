const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            data?.message ||
            (Array.isArray(data?.errors) ? data.errors.join(". ") : null) ||
            "Ocurrió un error al comunicarse con el servidor";
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    return data;
}