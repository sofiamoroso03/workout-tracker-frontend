import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRoutineByIdRequest } from "../services/routine.service.js";
import { getSessionsRequest } from "../services/session.service.js";

function extractItem(response, key) {
    if (response?.data?.[key]) return response.data[key];
    if (response?.data && !Array.isArray(response.data)) return response.data;
    return null;
}

function extractList(response, key) {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    return [];
}

export default function RoutineDetailPage() {
    const { id } = useParams();
    const [routine, setRoutine] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDetail() {
            setLoading(true);
            setError("");
            try {
                const [routineRes, sessionsRes] = await Promise.all([
                    getRoutineByIdRequest(id),
                    getSessionsRequest(id),
                ]);
                setRoutine(extractItem(routineRes, "routine"));
                setSessions(extractList(sessionsRes, "sessions"));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDetail();
    }, [id]);

    if (loading) return <p className="subtitle">Cargando detalle de la rutina...</p>;

    if (error || !routine) {
        return (
            <div className="section-stack">
                <div className="alert alert-error">{error || "No se encontró la rutina."}</div>
                <div>
                    <Link to="/routines" className="btn btn-outline btn-sm">
                        ← Volver a Rutinas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section-stack">
            <div>
                <Link to="/routines" className="btn btn-outline btn-sm">
                    ← Volver a Rutinas
                </Link>
            </div>

            <section className="card section-stack">
                <div>
                    <h1>{routine.name}</h1>
                    <div className="badges">
                        <span className="badge badge-accent">{routine.category}</span>
                        <span className="badge">Intensidad: {routine.intensity}</span>
                        <span className="badge">{routine.targetDuration} min objetivo</span>
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-item">
                        <span className="detail-label">Descripción</span>
                        <p className="detail-value">
                            {routine.description || "Sin descripción cargada."}
                        </p>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Sesiones registradas con esta rutina</span>
                        <p className="detail-value">{sessions.length}</p>
                    </div>
                </div>
            </section>

            <section className="section-stack">
                <h2>Sesiones asociadas ({sessions.length})</h2>

                {sessions.length === 0 ? (
                    <div className="card">
                        <p className="subtitle" style={{ marginBottom: 0 }}>
                            Todavía no registraste sesiones con esta rutina.
                        </p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {sessions.map((session) => (
                            <article key={session._id} className="card item-card">
                                <div>
                                    <h2>{session.title}</h2>
                                    <p className="subtitle" style={{ marginBottom: "0.6rem" }}>
                                        {session.date ? String(session.date).slice(0, 10) : "Sin fecha"}
                                    </p>
                                    <div className="badges">
                                        <span className="badge">{session.durationMinutes} min</span>
                                        {session.distanceKm !== undefined &&
                                            session.distanceKm !== null &&
                                            session.distanceKm !== "" && (
                                                <span className="badge">{session.distanceKm} km</span>
                                            )}
                                        <span className="badge">Esfuerzo {session.effort}/10</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <Link
                                        to={`/sessions/${session._id}`}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Ver sesión
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}