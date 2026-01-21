import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, IconButton, Modal, TextField 
} from "@mui/material";
import { Add, Delete, School, LocationOn, Edit } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner"; // ← AGREGADO
import './Sedes.css';

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [sedeToDelete, setSedeToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSedeId, setCurrentSedeId] = useState(null);
  const [form, setForm] = useState({ Ubicacion: "" });
  const [loading, setLoading] = useState(true); // ← AGREGADO
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const fetchSedes = async () => {
    setLoading(true); // ← AGREGADO
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sede/listar_sedes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) return navigate("/login");
      const data = await response.json();
      setSedes(data);
    } catch (e) { 
      console.error("Error al listar sedes:", e); 
    } finally {
      setLoading(false); // ← AGREGADO
    }
  };

  useEffect(() => { fetchSedes(); }, []);

  const handleOpenCreate = () => {
    setForm({ Ubicacion: "" });
    setIsEditing(false);
    setCurrentSedeId(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (sede) => {
    setForm({ Ubicacion: sede.Ubicacion });
    setCurrentSedeId(sede.ID_Sede);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm({ Ubicacion: "" });
    setIsEditing(false);
    setCurrentSedeId(null);
  };

  const handleSave = async () => {
    if (!form.Ubicacion.trim()) return alert("La ubicación es obligatoria");

    const url = isEditing 
      ? `${import.meta.env.VITE_API_URL}/sede/actualizar_sede/${currentSedeId}`
      : `${import.meta.env.VITE_API_URL}/sede/crear_sede`;
    
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ Ubicacion: form.Ubicacion }) 
      });

      const data = await response.json();

      if (response.ok) {
        handleCloseModal();
        fetchSedes();
      } else {
        alert(data.error || "Ocurrió un error en el servidor");
      }
    } catch (e) { 
      console.error("Error al guardar:", e);
      alert("Error de conexión con el servidor");
    }
  };

  const confirmDelete = (sede) => {
    setSedeToDelete(sede);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!sedeToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/sede/eliminar_sede/${sedeToDelete.ID_Sede}`, 
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        setOpenDeleteModal(false);
        setSedeToDelete(null);
        fetchSedes();
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (e) { 
      console.error("Error al eliminar:", e);
      alert("Error al eliminar la sede");
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a', color: 'white' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, ml: '260px', p: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Sedes Universitarias</Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>Administra las ubicaciones físicas de los clubes.</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleOpenCreate}
            sx={{ bgcolor: '#3b82f6', borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
          >
            AGREGAR SEDE
          </Button>
        </Box>

        {/* ← AGREGADO: Mostrar loading o contenido */}
        {loading ? (
          <LoadingSpinner message="Cargando sedes..." />
        ) : (
          <Grid container spacing={3}>
            {sedes.map((sede) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={sede.ID_Sede} sx={{ minWidth: '280px' }}>
                <Card 
                  className="sede-card"
                  sx={{ 
                    bgcolor: 'rgba(30, 41, 59, 0.5)', 
                    color: 'white', 
                    borderRadius: 5, 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(12px)',
                    height: '280px',
                    minHeight: '280px',
                    maxHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box 
                      className="icon-container"
                      sx={{ 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        mx: 'auto', 
                        mb: 2,
                        flexShrink: 0
                      }}
                    >
                      <School sx={{ color: '#3b82f6', fontSize: 30 }} />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      Sede Universitaria
                    </Typography>
                    
                    <Box 
                      className="sede-ubicacion"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 1, 
                        color: '#94a3b8',
                        height: '48px',
                        overflow: 'hidden',
                        flex: 1,
                        mb: 2
                      }}
                    >
                      <LocationOn fontSize="small" sx={{ flexShrink: 0 }} />
                      <Typography 
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}
                      >
                        {sede.Ubicacion}
                      </Typography>
                    </Box>
                    
                    <Box 
                      className="sede-acciones"
                      sx={{ 
                        mt: 'auto',
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 1 
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEdit(sede)} 
                        sx={{ 
                          color: '#94a3b8', 
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': { color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => confirmDelete(sede)}
                        sx={{ 
                          color: '#ef4444', 
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* MODAL PARA CREAR/EDITAR SEDE */}
      <Modal 
        open={openModal} 
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: '#1e293b', 
          p: 4, 
          width: 400, 
          borderRadius: 6, 
          border: '1px solid rgba(255,255,255,0.1)', 
          outline: 'none' 
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            {isEditing ? "✏️ Editar Sede" : "📍 Nueva Sede"}
          </Typography>
          
          <TextField 
            label="Ubicación del Campus" 
            fullWidth 
            variant="filled" 
            value={form.Ubicacion}
            onChange={(e) => setForm({ Ubicacion: e.target.value })}
            placeholder="Ej: Campus Central, Edificio A"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              '& .MuiFilledInput-root': { color: 'white' },
              '& .MuiInputLabel-root': { color: '#94a3b8' }
            }} 
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              fullWidth 
              onClick={handleCloseModal}
              sx={{ color: '#94a3b8', textTransform: 'none' }}
            >
              CANCELAR
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSave} 
              sx={{ 
                bgcolor: '#3b82f6', 
                textTransform: 'none', 
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              {isEditing ? 'ACTUALIZAR' : 'GUARDAR'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: '#1e293b', 
          p: 4, 
          width: 400, 
          borderRadius: 6, 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          outline: 'none' 
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
            ⚠️ Confirmar Eliminación
          </Typography>
          <Typography sx={{ mb: 3, color: '#94a3b8' }}>
            ¿Estás seguro de que deseas eliminar la sede <strong style={{ color: 'white' }}>"{sedeToDelete?.Ubicacion}"</strong>? Esta acción no se puede deshacer.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              fullWidth 
              onClick={() => setOpenDeleteModal(false)} 
              sx={{ color: '#94a3b8', textTransform: 'none' }}
            >
              CANCELAR
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleDelete} 
              sx={{ 
                bgcolor: '#ef4444', 
                textTransform: 'none', 
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#dc2626' }
              }}
            >
              ELIMINAR
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}