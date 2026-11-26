import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSessionByIdRequest } from "../services/session.service.js";

function extractItem(response, key) {
    if (response?.data?.[key]) return response.data[key];
    if (response?.data && !Array.isArray(response.data)) return response.data;
    return null;
}

export default function SessionDetailPage() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDetail() {
            setLoading(true);
            setError("");
            try {
                const response = await getSessionByIdRequest(id);
                setSession(extractItem(response, "session"));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDetail();
    }, [id]);

    if (loading) return <p className="subtitle">Cargando detalle de la sesión...</p>;

    if (error || !session) {
        return (
            <div className="section-stack">
                <div className="alert alert-error">{error || "No se encontró la sesión."}</div>
                <div>
                    <Link to="/sessions" className="btn btn-outline btn-sm">
                        ← Volver a Sesiones
                    </Link>
                </div>
            </div>
        );
    }

    const routineObj = typeof session.routineId === "object" ? session.routineId : null;
    const routineLinkId = routineObj?._id || (typeof session.routineId === "string" ? session.routineId : null);

    return (
        <div className="section-stack">
            <div>
                <Link to="/sessions" className="btn btn-outline btn-sm">
                    ← Volver a Sesiones
                </Link>
            </div>

            <section className="card section-stack">
                <div>
                    <h1>{session.title}</h1>
                    <p className="subtitle" style={{ marginBottom: "0.75rem" }}>
                        Fecha: {session.date ? String(session.date).slice(0, 10) : "Sin fecha"}
                    </p>
                    <div className="badges">
                        {routineObj?.name && (
                            <span className="badge badge-accent">{routineObj.name}</span>
                        )}
                        <span className="badge">{session.durationMinutes} min</span>
                        {session.distanceKm !== undefined &&
                            session.distanceKm !== null &&
                            session.distanceKm !== "" && (
                                <span className="badge">{session.distanceKm} km</span>
                            )}
                        <span className="badge">Esfuerzo {session.effort}/10</span>
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-item">
                        <span className="detail-label">Notas del entrenamiento</span>
                        <p className="detail-value">
                            {session.notes || "Sin notas registradas."}
                        </p>
                    </div>

                    {routineLinkId && (
                        <div className="detail-item">
                            <span className="detail-label">Rutina vinculada</span>
                            <p className="detail-value" style={{ marginBottom: "0.5rem" }}>
                                {routineObj?.name
                                    ? `${routineObj.name} (${routineObj.category || "sin categoría"})`
                                    : "Ver plan de rutina asociado"}
                            </p>
                            <Link
                                to={`/routines/${routineLinkId}`}
                                className="btn btn-outline btn-sm"
                            >
                                Ver detalle de la rutina
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}