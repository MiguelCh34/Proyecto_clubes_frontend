import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clubes from "./pages/Clubes.jsx";
import Actividades from "./pages/Actividades.jsx";
import Sedes from "./pages/Sedes.jsx";
import Facultades from "./pages/Facultad.jsx";
import Categorias from "./pages/Categorias.jsx";
import Roles from "./pages/Roles.jsx";
import Estados from "./pages/Estados.jsx";
import Personas from "./pages/Personas.jsx";
import MiPerfil from "./pages/MiPerfil.jsx";  // ← AGREGAR ESTO
import { 
  Inscripciones, 
  Participacion
} from "./pages/PlaceholderPages.jsx";

function ProtectedRoute({ children }) {
  const { estaAutenticado } = useAuth();
  return estaAutenticado() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { estaAutenticado, esAdmin } = useAuth();
  
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!esAdmin()) {
    return <Navigate to="/clubes" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas SOLO ADMIN */}
      <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/categorias" element={<AdminRoute><Categorias /></AdminRoute>} />
      <Route path="/roles" element={<AdminRoute><Roles /></AdminRoute>} />
      <Route path="/estados" element={<AdminRoute><Estados /></AdminRoute>} />
      
      {/* Rutas para TODOS los usuarios autenticados */}
      <Route path="/clubes" element={<ProtectedRoute><Clubes /></ProtectedRoute>} />
      <Route path="/actividades" element={<ProtectedRoute><Actividades /></ProtectedRoute>} />
      <Route path="/sedes" element={<ProtectedRoute><Sedes /></ProtectedRoute>} />
      <Route path="/facultades" element={<ProtectedRoute><Facultades /></ProtectedRoute>} />
      <Route path="/inscripciones" element={<ProtectedRoute><Inscripciones /></ProtectedRoute>} />
      <Route path="/participacion" element={<ProtectedRoute><Participacion /></ProtectedRoute>} />
      <Route path="/personas" element={<ProtectedRoute><Personas /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} /> {/* ← AGREGAR ESTO */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}