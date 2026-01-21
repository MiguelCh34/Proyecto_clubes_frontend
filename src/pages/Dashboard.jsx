import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Group,
  Event,
  School,
  LocationOn,
  Person,
  AdminPanelSettings,
  Flag
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  
  const [stats, setStats] = useState({
    clubes: 0,
    actividades: 0,
    facultades: 0,
    sedes: 0,
    personas: 0,
    roles: 0,
    estados: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const errorList = [];
        
        const fetchWithErrorHandling = async (url, name) => {
          try {
            const res = await fetch(url, { headers });
            if (res.status === 401) {
              localStorage.removeItem("access_token");
              navigate("/login");
              return null;
            }
            if (!res.ok) {
              errorList.push(`${name}: HTTP ${res.status}`);
              return [];
            }
            return await res.json();
          } catch (error) {
            errorList.push(`${name}: ${error.message}`);
            return [];
          }
        };

        const [clubes, actividades, facultades, sedes, personas, roles, estados] = await Promise.all([
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/club/listar_clubes`, 'Clubes'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/actividad/listar_actividades`, 'Actividades'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/facultad/listar_facultades`, 'Facultades'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/sede/listar_sedes`, 'Sedes'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/persona/listar_usuarios`, 'Personas'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/rol/listar_roles`, 'Roles'),
          fetchWithErrorHandling(`${import.meta.env.VITE_API_URL}/estado/listar_estados`, 'Estados')
        ]);

        setStats({
          clubes: (clubes && clubes.length) || 0,
          actividades: (actividades && actividades.length) || 0,
          facultades: (facultades && facultades.length) || 0,
          sedes: (sedes && sedes.length) || 0,
          personas: (personas && personas.length) || 0,
          roles: (roles && roles.length) || 0,
          estados: (estados && estados.length) || 0
        });

        setErrors(errorList);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        setErrors([`Error general: ${error.message}`]);
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, navigate]);

  const menuItems = [
    {
      title: "Clubes",
      description: "Gestiona y organiza los grupos activos",
      icon: <Group sx={{ fontSize: 36 }} />,
      path: "/clubes",
      color: "#3b82f6",
      stats: loading ? "..." : `${stats.clubes} activos`
    },
    {
      title: "Actividades",
      description: "Administra eventos y actividades",
      icon: <Event sx={{ fontSize: 36 }} />,
      path: "/actividades",
      color: "#8b5cf6",
      stats: loading ? "..." : `${stats.actividades} registradas`
    },
    {
      title: "Facultades",
      description: "Administración de facultades universitarias",
      icon: <School sx={{ fontSize: 36 }} />,
      path: "/facultades",
      color: "#ec4899",
      stats: loading ? "..." : `${stats.facultades} registradas`
    },
    {
      title: "Sedes",
      description: "Gestión de sedes y ubicaciones",
      icon: <LocationOn sx={{ fontSize: 36 }} />,
      path: "/sedes",
      color: "#f59e0b",
      stats: loading ? "..." : `${stats.sedes} sedes`
    },
    {
      title: "Personas",
      description: "Administración de usuarios del sistema",
      icon: <Person sx={{ fontSize: 36 }} />,
      path: "/personas",
      color: "#14b8a6",
      stats: loading ? "..." : `${stats.personas} usuarios`
    },
    {
      title: "Roles",
      description: "Gestión de roles y permisos",
      icon: <AdminPanelSettings sx={{ fontSize: 36 }} />,
      path: "/roles",
      color: "#a855f7",
      stats: loading ? "..." : `${stats.roles} roles`
    },
    {
      title: "Estados",
      description: "Configuración de estados del sistema",
      icon: <Flag sx={{ fontSize: 36 }} />,
      path: "/estados",
      color: "#ef4444",
      stats: loading ? "..." : `${stats.estados} estados`
    }
  ];

  const DashboardCard = ({ item }) => (
    <Card
      onClick={() => navigate(item.path)}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(30, 41, 59, 0.5)',
        color: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: item.color,
          boxShadow: `0 8px 24px -8px ${item.color}40`
        }
      }}
    >
      <CardContent 
        sx={{ 
          p: 2.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 2.5 }
        }}
      >
        <Box
          sx={{
            bgcolor: `${item.color}20`,
            width: 50,
            height: 50,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            flexShrink: 0,
            color: item.color
          }}
        >
          {item.icon}
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            textAlign: 'center',
            mb: 1,
            fontSize: '16px',
            color: 'white',
            height: '24px',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: '13px',
            textAlign: 'center',
            mb: 1.5,
            height: '36px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            lineHeight: '18px',
            flexShrink: 0
          }}
        >
          {item.description}
        </Typography>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            p: 0.8,
            textAlign: 'center',
            mt: 'auto',
            flexShrink: 0
          }}
        >
          <Typography
            sx={{
              color: item.color,
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            {item.stats}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, p: 4, ml: '260px' }}>
        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>
            Panel de Control
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
            Bienvenido al sistema de gestión de clubes universitarios
          </Typography>
        </Box>

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6">Errores al cargar datos:</Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">• {error}</Typography>
            ))}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        )}

        {!loading && (
          <Box sx={{ mb: 4 }}>
            {/* Primera fila: 4 tarjetas */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2.5,
                mb: 2.5
              }}
            >
              {menuItems.slice(0, 4).map((item, index) => (
                <Box key={index} sx={{ height: '240px', minWidth: 0 }}>
                  <DashboardCard item={item} />
                </Box>
              ))}
            </Box>
            
            {/* Segunda fila: 3 tarjetas centradas */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2.5
              }}
            >
              <Box /> {/* Espacio vacío */}
              {menuItems.slice(4, 7).map((item, index) => (
                <Box key={index} sx={{ height: '240px', minWidth: 0 }}>
                  <DashboardCard item={item} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {!loading && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2.5, color: 'white' }}>
              Resumen General
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2.5 }}>
              <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5 }}>Total Clubes</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#3b82f6' }}>{stats.clubes}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5 }}>Actividades</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#8b5cf6' }}>{stats.actividades}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5 }}>Facultades</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#ec4899' }}>{stats.facultades}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '13px', mb: 0.5 }}>Sedes</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#f59e0b' }}>{stats.sedes}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}