import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loginRequest } from "../services/auth.service.js";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginRequest({ email, password });
            const token = response?.data?.auth_token || response?.data?.token;

            if (!token) {
                throw new Error("No se recibió el token de autenticación");
            }

            login(token, response?.data?.user);
            navigate("/sessions");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-layout">
            <section className="card auth-card">
                <h1>Iniciar sesión</h1>
                <p className="subtitle">Ingresá para registrar y seguir tus entrenamientos.</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form">
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
                            placeholder="••••••"
                            required
                        />
                    </label>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Todavía no tenés cuenta? <Link to="/register">Registrate</Link>
                </p>
            </section>
        </main>
    );
}