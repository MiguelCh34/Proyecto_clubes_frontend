import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Group,
  Event,
  LocationOn,
  School,
  Person,
  AdminPanelSettings,
  Flag,
  Dashboard as DashboardIcon,
  ExitToApp,
  AccountCircle
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, esAdmin } = useAuth();
  const [perfil, setPerfil] = useState(null);

  // Cargar foto de perfil
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/persona/obtener_perfil`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };
    cargarPerfil();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Menú para ADMIN
  const adminMenuItems = [
    { icon: <DashboardIcon />, label: "DASHBOARD", path: "/dashboard", section: null },
    { icon: <Group />, label: "Clubes", path: "/clubes", section: "GESTIÓN" },
    { icon: <Event />, label: "Actividades", path: "/actividades", section: "GESTIÓN" },
    { icon: <LocationOn />, label: "Sedes", path: "/sedes", section: "GESTIÓN" },
    { icon: <School />, label: "Facultades", path: "/facultades", section: "GESTIÓN" },
    { icon: <Person />, label: "Personas", path: "/personas", section: "GESTIÓN" },
    { icon: <AdminPanelSettings />, label: "Roles", path: "/roles", section: "GESTIÓN" },
    { icon: <Flag />, label: "Estados", path: "/estados", section: "GESTIÓN" },
    { icon: <AccountCircle />, label: "Mi Perfil", path: "/perfil", section: "GESTIÓN" } // ← NUEVO
  ];

  // Menú para USUARIO
  const userMenuItems = [
    { icon: <Group />, label: "Explorar Clubes", path: "/clubes", section: "GESTIÓN" },
    { icon: <Event />, label: "Actividades", path: "/actividades", section: "GESTIÓN" },
    { icon: <Person />, label: "Mi Perfil", path: "/perfil", section: "GESTIÓN" }
  ];

  const menuItems = esAdmin() ? adminMenuItems : userMenuItems;

  // Agrupar por sección
  const sections = {};
  menuItems.forEach(item => {
    if (item.section) {
      if (!sections[item.section]) sections[item.section] = [];
      sections[item.section].push(item);
    }
  });

  const dashboardItem = menuItems.find(item => !item.section);

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Group sx={{ fontSize: 32, color: "#3b82f6" }} />
        </div>
        <div>
          <h2 className="sidebar-title">UniClubs</h2>
          <span className="sidebar-badge">
            {esAdmin() ? "(Admin)" : "(Usuario)"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Dashboard (solo admin) */}
        {dashboardItem && (
          <div
            className={`sidebar-item ${location.pathname === dashboardItem.path ? "active" : ""}`}
            onClick={() => navigate(dashboardItem.path)}
          >
            {dashboardItem.icon}
            <span>{dashboardItem.label}</span>
          </div>
        )}

        {/* Secciones */}
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName}>
            <div className="sidebar-section-title">{sectionName}</div>
            {items.map((item, index) => (
              <div
                key={index}
                className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar
            src={perfil?.Foto_Perfil}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid #3b82f6'
            }}
          />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {perfil?.Nombre && perfil?.Apellido
                ? `${perfil.Nombre} ${perfil.Apellido}`
                : user?.name || "Usuario"}
            </div>
            <div className="sidebar-user-email">{user?.email || ""}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <ExitToApp sx={{ fontSize: 20 }} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}