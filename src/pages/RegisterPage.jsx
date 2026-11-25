import { useState } from "react";
import { Link } from "react-router-dom";
import { registerRequest } from "../services/auth.service.js";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await registerRequest({ username, email, password });
            setSuccess(
                response?.message ||
                    "Cuenta creada. Revisá tu email para verificarla antes de iniciar sesión."
            );
            setUsername("");
            setEmail("");
            setPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-layout">
            <section className="card auth-card">
                <h1>Crear cuenta</h1>
                <p className="subtitle">Armá tu perfil y empezá a registrar tus rutinas.</p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <label className="field">
                        <span>Nombre de usuario</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ej: Sofia"
                            minLength={2}
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Contraseña</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </label>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Registrarme"}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
            </section>
        </main>
    );
}   