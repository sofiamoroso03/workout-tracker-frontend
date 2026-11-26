import { apiRequest } from "./api.js";

export function getRoutinesRequest() {
    return apiRequest("/api/routines");
}

export function createRoutineRequest(payload) {
    return apiRequest("/api/routines", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateRoutineRequest(id, payload) {
    return apiRequest(`/api/routines/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteRoutineRequest(id) {
    return apiRequest(`/api/routines/${id}`, {
        method: "DELETE",
    });
}

export function getRoutineByIdRequest(id) {
    return apiRequest(`/api/routines/${id}`);
}