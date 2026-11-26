import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    createRoutineRequest,
    deleteRoutineRequest,
    getRoutinesRequest,
    updateRoutineRequest,
} from "../services/routine.service.js";

const INITIAL_FORM = {
    name: "",
    category: "running",
    intensity: "media",
    targetDuration: 30,
    description: "",
};

function extractList(response, key) {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    return [];
}

export default function RoutinesPage() {
    const [routines, setRoutines] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    async function loadRoutines() {
        setLoading(true);
        setError("");
        try {
            const response = await getRoutinesRequest();
            setRoutines(extractList(response, "routines"));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRoutines();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleEdit(routine) {
        setEditingId(routine._id);
        setForm({
            name: routine.name || "",
            category: routine.category || "running",
            intensity: routine.intensity || "media",
            targetDuration: routine.targetDuration ?? 30,
            description: routine.description || "",
        });
        setError("");
        setFeedback("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleCancelEdit() {
        setEditingId(null);
        setForm(INITIAL_FORM);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setFeedback("");
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            category: form.category,
            intensity: form.intensity,
            targetDuration: Number(form.targetDuration),
            description: form.description.trim(),
        };

        try {
            if (editingId) {
                await updateRoutineRequest(editingId, payload);
                setFeedback("Rutina actualizada correctamente.");
            } else {
                await createRoutineRequest(payload);
                setFeedback("Rutina creada correctamente.");
            }
            setForm(INITIAL_FORM);
            setEditingId(null);
            await loadRoutines();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(routine) {
        const confirmed = window.confirm(
            `¿Querés eliminar la rutina "${routine.name}"?`
        );
        if (!confirmed) return;

        setError("");
        setFeedback("");
        try {
            await deleteRoutineRequest(routine._id);
            setFeedback("Rutina eliminada.");
            if (editingId === routine._id) {
                handleCancelEdit();
            }
            await loadRoutines();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="section-stack">
            <div className="page-header">
                <div>
                    <h1>Mis Rutinas</h1>
                    <p className="subtitle">
                        Creá y organizá tus planes base para asociarlos a cada entrenamiento.
                    </p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {feedback && <div className="alert alert-success">{feedback}</div>}

            <section className="card">
                <h2>{editingId ? "Editar rutina" : "Nueva rutina"}</h2>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-grid">
                        <label className="field">
                            <span>Nombre</span>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ej: Intervalos de velocidad"
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Categoría</span>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="running">Running</option>
                                <option value="fuerza">Fuerza</option>
                                <option value="cardio">Cardio</option>
                                <option value="movilidad">Movilidad</option>
                                <option value="ciclismo">Ciclismo</option>
                                <option value="otro">Otro</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Intensidad</span>
                            <select
                                name="intensity"
                                value={form.intensity}
                                onChange={handleChange}
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </label>

                        <label className="field">
                            <span>Duración objetivo (min)</span>
                            <input
                                type="number"
                                name="targetDuration"
                                value={form.targetDuration}
                                onChange={handleChange}
                                min={1}
                                max={600}
                                required
                            />
                        </label>
                    </div>

                    <label className="field">
                        <span>Descripción (opcional)</span>
                        <textarea
                            name="description"
                            rows={2}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Detalle de bloques, entrada en calor o notas..."
                        />
                    </label>

                    <div className="card-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving
                                ? "Guardando..."
                                : editingId
                                ? "Guardar cambios"
                                : "Crear rutina"}
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
            </section>

            <section className="section-stack">
                <h2>Listado ({routines.length})</h2>

                {loading ? (
                    <p className="subtitle">Cargando rutinas...</p>
                ) : routines.length === 0 ? (
                    <div className="card">
                        <p className="subtitle" style={{ marginBottom: 0 }}>
                            Todavía no tenés rutinas creadas. Cargá la primera arriba.
                        </p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {routines.map((routine) => (
                            <article key={routine._id} className="card item-card">
                                <div>
                                    <h2>{routine.name}</h2>
                                    <div className="badges" style={{ marginBottom: "0.75rem" }}>
                                        <span className="badge badge-accent">{routine.category}</span>
                                        <span className="badge">Intensidad: {routine.intensity}</span>
                                        <span className="badge">{routine.targetDuration} min</span>
                                    </div>
                                    {routine.description && (
                                        <p className="subtitle" style={{ marginBottom: 0 }}>
                                            {routine.description}
                                        </p>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <Link
                                        to={`/routines/${routine._id}`}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Ver detalle
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEdit(routine)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(routine)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}