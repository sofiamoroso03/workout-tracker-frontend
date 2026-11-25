import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <span className="brand">Workout Tracker</span>

                <nav className="nav-links">
                    <NavLink to="/sessions" className={({ isActive }) => (isActive ? "active" : "")}>
                        Sesiones
                    </NavLink>
                    <NavLink to="/routines" className={({ isActive }) => (isActive ? "active" : "")}>
                        Rutinas
                    </NavLink>
                </nav>

                <div className="nav-user">
                    <span className="user-label">{user?.username || user?.email || "Atleta"}</span>
                    <button type="button" className="btn btn-outline" onClick={handleLogout}>
                        Salir
                    </button>
                </div>
            </div>
        </header>
    );
}