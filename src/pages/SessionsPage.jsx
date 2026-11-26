import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoutinesRequest } from "../services/routine.service.js";
import {
    createSessionRequest,
    deleteSessionRequest,
    getSessionsRequest,
    updateSessionRequest,
} from "../services/session.service.js";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM = {
    title: "",
    date: todayISO(),
    durationMinutes: 30,
    distanceKm: "",
    effort: 7,
    notes: "",
    routineId: "",
};

function extractList(response, key) {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    return [];
}

function getRoutineIdValue(routineField) {
    if (!routineField) return "";
    return typeof routineField === "object" ? routineField._id || "" : routineField;
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [filterRoutineId, setFilterRoutineId] = useState("");
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    async function loadRoutines() {
        try {
            const response = await getRoutinesRequest();
            const list = extractList(response, "routines");
            setRoutines(list);
            setForm((prev) =>
                !prev.routineId && list.length > 0
                    ? { ...prev, routineId: list[0]._id }
                    : prev
            );
        } catch (err) {
            setError(err.message);
        }
    }

    async function loadSessions(routineId = filterRoutineId) {
        setLoading(true);
        setError("");
        try {
            const response = await getSessionsRequest(routineId);
            setSessions(extractList(response, "sessions"));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRoutines();
    }, []);

    useEffect(() => {
        loadSessions(filterRoutineId);
    }, [filterRoutineId]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleEdit(session) {
        setEditingId(session._id);
        setForm({
            title: session.title || "",
            date: session.date ? String(session.date).slice(0, 10) : todayISO(),
            durationMinutes: session.durationMinutes ?? 30,
            distanceKm: session.distanceKm ?? "",
            effort: session.effort ?? 7,
            notes: session.notes || "",
            routineId: getRoutineIdValue(session.routineId),
        });
        setError("");
        setFeedback("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleCancelEdit() {
        setEditingId(null);
        setForm({
            ...INITIAL_FORM,
            routineId: routines[0]?._id || "",
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setFeedback("");
        setSaving(true);

        const payload = {
            title: form.title.trim(),
            date: form.date,
            durationMinutes: Number(form.durationMinutes),
            effort: Number(form.effort),
            notes: form.notes.trim(),
            routineId: form.routineId,
        };

        if (form.distanceKm !== "" && form.distanceKm !== null) {
            payload.distanceKm = Number(form.distanceKm);
        }

        try {
            if (editingId) {
                await updateSessionRequest(editingId, payload);
                setFeedback("Sesión actualizada correctamente.");
            } else {
                await createSessionRequest(payload);
                setFeedback("Sesión registrada correctamente.");
            }
            setEditingId(null);
            setForm({
                ...INITIAL_FORM,
                routineId: routines[0]?._id || "",
            });
            await loadSessions(filterRoutineId);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(session) {
        const confirmed = window.confirm(
            `¿Querés eliminar la sesión "${session.title}"?`
        );
        if (!confirmed) return;

        setError("");
        setFeedback("");
        try {
            await deleteSessionRequest(session._id);
            setFeedback("Sesión eliminada.");
            if (editingId === session._id) {
                handleCancelEdit();
            }
            await loadSessions(filterRoutineId);
        } catch (err) {
            setError(err.message);
        }
    }

    const totalMinutes = sessions.reduce(
        (acc, item) => acc + (Number(item.durationMinutes) || 0),
        0
    );
    const totalKm = sessions.reduce(
        (acc, item) => acc + (Number(item.distanceKm) || 0),
        0
    );

    return (
        <div className="section-stack">
            <div className="page-header">
                <div>
                    <h1>Mis Sesiones</h1>
                    <p className="subtitle">
                        Registrá cada entrenamiento y filtrá tu historial por rutina.
                    </p>
                </div>
            </div>

            <section className="stats-grid">
                <div className="card">
                    <div className="stat-value">{sessions.length}</div>
                    <div className="stat-label">Sesiones registradas</div>
                </div>
                <div className="card">
                    <div className="stat-value">{totalMinutes} min</div>
                    <div className="stat-label">Tiempo total</div>
                </div>
                <div className="card">
                    <div className="stat-value">{totalKm.toFixed(1)} km</div>
                    <div className="stat-label">Distancia acumulada</div>
                </div>
            </section>

            {error && <div className="alert alert-error">{error}</div>}
            {feedback && <div className="alert alert-success">{feedback}</div>}

            <section className="card">
                <h2>{editingId ? "Editar sesión" : "Registrar entrenamiento"}</h2>

                {routines.length === 0 ? (
                    <p className="subtitle" style={{ marginBottom: 0 }}>
                        Antes de cargar una sesión necesitás crear al menos una rutina en{" "}
                        <Link to="/routines">Mis Rutinas</Link>.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-grid">
                            <label className="field">
                                <span>Título</span>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Ej: Fondo en el parque"
                                    required
                                />
                            </label>

                            <label className="field">
                                <span>Rutina asociada</span>
                                <select
                                    name="routineId"
                                    value={form.routineId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccioná una rutina</option>
                                    {routines.map((routine) => (
                                        <option key={routine._id} value={routine._id}>
                                            {routine.name} ({routine.category})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <span>Fecha</span>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label className="field">
                                <span>Duración (min)</span>
                                <input
                                    type="number"
                                    name="durationMinutes"
                                    value={form.durationMinutes}
                                    onChange={handleChange}
                                    min={1}
                                    required
                                />
                            </label>

                            <label className="field">
                                <span>Distancia en km (opcional)</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    name="distanceKm"
                                    value={form.distanceKm}
                                    onChange={handleChange}
                                    placeholder="Ej: 5.2"
                                />
                            </label>

                            <label className="field">
                                <span>Esfuerzo percibido (1 a 10)</span>
                                <input
                                    type="number"
                                    name="effort"
                                    value={form.effort}
                                    onChange={handleChange}
                                    min={1}
                                    max={10}
                                    required
                                />
                            </label>
                        </div>

                        <label className="field">
                            <span>Notas (opcional)</span>
                            <textarea
                                name="notes"
                                rows={2}
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Sensaciones, clima, ritmo..."
                            />
                        </label>

                        <div className="card-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving
                                    ? "Guardando..."
                                    : editingId
                                    ? "Guardar cambios"
                                    : "Guardar sesión"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={handleCancelEdit}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </section>

            <section className="section-stack">
                <div className="page-header">
                    <h2>Historial ({sessions.length})</h2>

                    <label className="field filter-field">
                        <span>Filtrar por rutina</span>
                        <select
                            value={filterRoutineId}
                            onChange={(e) => setFilterRoutineId(e.target.value)}
                        >
                            <option value="">Todas las rutinas</option>
                            {routines.map((routine) => (
                                <option key={routine._id} value={routine._id}>
                                    {routine.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {loading ? (
                    <p className="subtitle">Cargando sesiones...</p>
                ) : sessions.length === 0 ? (
                    <div className="card">
                        <p className="subtitle" style={{ marginBottom: 0 }}>
                            No hay sesiones registradas para este filtro.
                        </p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {sessions.map((session) => {
                            const routineObj =
                                typeof session.routineId === "object"
                                    ? session.routineId
                                    : routines.find((r) => r._id === session.routineId);

                            return (
                                <article key={session._id} className="card item-card">
                                    <div>
                                        <h2>{session.title}</h2>
                                        <p className="subtitle" style={{ marginBottom: "0.6rem" }}>
                                            {session.date
                                                ? String(session.date).slice(0, 10)
                                                : "Sin fecha"}
                                        </p>

                                        <div
                                            className="badges"
                                            style={{ marginBottom: "0.75rem" }}
                                        >
                                            {routineObj?.name && (
                                                <span className="badge badge-accent">
                                                    {routineObj.name}
                                                </span>
                                            )}
                                            <span className="badge">
                                                {session.durationMinutes} min
                                            </span>
                                            {session.distanceKm !== undefined &&
                                                session.distanceKm !== null &&
                                                session.distanceKm !== "" && (
                                                    <span className="badge">
                                                        {session.distanceKm} km
                                                    </span>
                                                )}
                                            <span className="badge">
                                                Esfuerzo {session.effort}/10
                                            </span>
                                        </div>

                                        {session.notes && (
                                            <p className="subtitle" style={{ marginBottom: 0 }}>
                                                {session.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="card-actions">
                                        <Link
                                            to={`/sessions/${session._id}`}
                                            className="btn btn-outline btn-sm"
                                        >
                                            Ver detalle
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleEdit(session)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(session)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}