import { apiRequest } from "./api.js";

export function registerRequest({ username, email, password }) {
    return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
    });
}

export function loginRequest({ email, password }) {
    return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}