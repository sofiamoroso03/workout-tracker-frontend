import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import SessionsPage from "./pages/SessionsPage.jsx";

function PrivateLayout() {
    return (
        <>
            <Navbar />
            <main className="page-container">
                <Outlet />
            </main>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route element={<PrivateLayout />}>
                            <Route path="/sessions" element={<SessionsPage />} />
                            <Route path="/routines" element={<RoutinesPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/sessions" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}