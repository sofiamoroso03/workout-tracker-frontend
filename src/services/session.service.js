import { apiRequest } from "./api.js";

export function getSessionsRequest(routineId = "") {
    const query = routineId ? `?routineId=${encodeURIComponent(routineId)}` : "";
    return apiRequest(`/api/sessions${query}`);
}

export function createSessionRequest(payload) {
    return apiRequest("/api/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateSessionRequest(id, payload) {
    return apiRequest(`/api/sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteSessionRequest(id) {
    return apiRequest(`/api/sessions/${id}`, {
        method: "DELETE",
    });
}

export function getSessionByIdRequest(id) {
    return apiRequest(`/api/sessions/${id}`);
}