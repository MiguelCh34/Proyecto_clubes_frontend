import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, IconButton, Modal, TextField 
} from "@mui/material";
import { Add, Delete, AccountBalance, Edit } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner"; // ← AGREGADO
import './Facultad.css';

export default function Facultades() {
  const [facultades, setFacultades] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [facultadToDelete, setFacultadToDelete] = useState(null);
  const [form, setForm] = useState({ Nombre: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true); // ← AGREGADO
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const fetchFacultades = async () => {
    setLoading(true); // ← AGREGADO
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/facultad/listar_facultades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) return navigate("/login");
      const data = await response.json();
      setFacultades(data);
    } catch (e) { 
      console.error("Error al cargar facultades:", e); 
    } finally {
      setLoading(false); // ← AGREGADO
    }
  };

  useEffect(() => { fetchFacultades(); }, []);

  const handleSave = async () => {
    if (!form.Nombre.trim()) return alert("El nombre es obligatorio");

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/facultad/actualizar_facultad/${editingId}`
        : `${import.meta.env.VITE_API_URL}/facultad/crear_facultad`;
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setOpenModal(false);
        setForm({ Nombre: "" });
        setIsEditing(false);
        setEditingId(null);
        fetchFacultades();
      } else {
        const err = await response.json();
        alert(err.error || `Error al ${isEditing ? 'actualizar' : 'crear'}`);
      }
    } catch (e) { 
      console.error(e);
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} la facultad`);
    }
  };

  const handleEdit = (facultad) => {
    setForm({ Nombre: facultad.Nombre });
    setIsEditing(true);
    setEditingId(facultad.ID_Facultad);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm({ Nombre: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const confirmDelete = (facultad) => {
    setFacultadToDelete(facultad);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!facultadToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/facultad/eliminar_facultad/${facultadToDelete.ID_Facultad}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setFacultadToDelete(null);
        fetchFacultades();
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (e) { 
      console.error(e);
      alert("Error al eliminar la facultad");
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a', color: 'white' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, ml: '260px', p: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Facultades</Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>Administración de facultades universitarias.</Typography>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#3b82f6', borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
          >
            AGREGAR FACULTAD
          </Button>
        </Box>

        {/* ← AGREGADO: Mostrar loading o contenido */}
        {loading ? (
          <LoadingSpinner message="Cargando facultades..." />
        ) : (
          <Grid container spacing={3}>
            {facultades.map((fac) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={fac.ID_Facultad} sx={{ minWidth: '280px' }}>
                <Card 
                  className="facultad-card"
                  sx={{ 
                    bgcolor: 'rgba(30, 41, 59, 0.5)', 
                    color: 'white', 
                    borderRadius: 5, 
                    border: '1px solid rgba(255,255,255,0.1)',
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
                      <AccountBalance sx={{ color: '#3b82f6', fontSize: 30 }} />
                    </Box>
                    
                    <Typography 
                      className="facultad-nombre"
                      variant="h6" 
                      fontWeight="bold"
                      sx={{
                        height: '48px',
                        lineHeight: '24px',
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        flex: 1,
                        mb: 2
                      }}
                    >
                      {fac.Nombre}
                    </Typography>
                    
                    <Box 
                      className="facultad-acciones"
                      sx={{ 
                        mt: 'auto',
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 1 
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(fac)}
                        sx={{ 
                          color: '#94a3b8',
                          '&:hover': { color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => confirmDelete(fac)}
                        sx={{ 
                          color: '#ef4444',
                          '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.1)' }
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

      {/* MODAL PARA CREAR/EDITAR FACULTAD */}
      <Modal 
        open={openModal} 
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box className="modal-content" sx={{ bgcolor: '#1e293b', p: 4, width: 400, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            {isEditing ? '✏️ Editar Facultad' : '🏛️ Nueva Facultad'}
          </Typography>
          <TextField 
            label="Nombre de la Facultad" 
            fullWidth 
            variant="filled" 
            value={form.Nombre}
            onChange={(e) => setForm({ Nombre: e.target.value })}
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
            ¿Estás seguro de que deseas eliminar la facultad <strong style={{ color: 'white' }}>"{facultadToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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