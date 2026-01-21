import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Construction } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";

export default function PlaceholderPage({ title = "Página en Construcción", subtitle = "Esta sección estará disponible próximamente" }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Sidebar />
      
      <div style={{ flexGrow: 1, padding: '32px', marginLeft: '260px', color: 'white' }}>
        <div style={{ marginBottom: '32px' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>
            {title}
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '16px' }}>
            {subtitle}
          </Typography>
        </div>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}>
          <Card sx={{
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            color: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: 500,
            width: '100%',
            textAlign: 'center'
          }}>
            <CardContent sx={{ p: 5 }}>
              <Box sx={{
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                width: 100,
                height: 100,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <Construction sx={{ fontSize: 50, color: '#3b82f6' }} />
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                🚧 En Construcción
              </Typography>

              <Typography sx={{ color: '#94a3b8', mb: 4 }}>
                Esta funcionalidad estará disponible próximamente. Estamos trabajando para ofrecerte la mejor experiencia.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  bgcolor: '#3b82f6',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  '&:hover': { bgcolor: '#2563eb' }
                }}
              >
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        </Box>
      </div>
    </div>
  );
}

// Componentes específicos para cada ruta
export function Inscripciones() {
  return <PlaceholderPage title="Inscripciones" subtitle="Gestión de inscripciones a clubes" />;
}

export function Participacion() {
  return <PlaceholderPage title="Participación" subtitle="Seguimiento de participación en actividades" />;
}

export function Personas() {
  return <PlaceholderPage title="Personas" subtitle="Administración de usuarios del sistema" />;
}

export function Roles() {
  return <PlaceholderPage title="Roles" subtitle="Gestión de roles y permisos" />;
}

export function Estados() {
  return <PlaceholderPage title="Estados" subtitle="Configuración de estados del sistema" />;
}