import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, IconButton, Modal, TextField, Chip, MenuItem 
} from "@mui/material";
import { Add, Delete, Close, CalendarMonth, Event, LocationOn, Edit, Group } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import './Actividades.css';

export default function Actividades() {
  const { esAdmin } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState(null);
  const [selectedAct, setSelectedAct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [form, setForm] = useState({
    Nombre: "", Descripcion: "", Fecha: "", Lugar: "",
    ID_Club: "", ID_Estado: 1, ID_Usuario: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Cargar actividades
      const resAct = await fetch(`${import.meta.env.VITE_API_URL}/actividad/listar_actividades`, { headers });
      const dataAct = await resAct.json();
      setActividades(dataAct);

      // Cargar clubes
      const resClub = await fetch(`${import.meta.env.VITE_API_URL}/club/listar_clubes`, { headers });
      setClubes(await resClub.json());

      // Si es usuario normal, cargar sus inscripciones
      if (!esAdmin()) {
        try {
          const resInscripciones = await fetch(`${import.meta.env.VITE_API_URL}/inscripcion/mis_inscripciones`, { headers });
          if (resInscripciones.ok) {
            const dataInscripciones = await resInscripciones.json();
            setMisInscripciones(dataInscripciones);
            
            // Filtrar actividades solo de clubes inscritos
            const clubsInscritos = dataInscripciones.map(insc => insc.ID_Club);
            const actividadesFiltradas = dataAct.filter(act => clubsInscritos.includes(act.ID_Club));
            setActividadesFiltradas(actividadesFiltradas);
          } else {
            setActividadesFiltradas([]);
          }
        } catch (error) {
          console.error("Error al cargar inscripciones:", error);
          setActividadesFiltradas([]);
        }
      } else {
        // Si es admin, mostrar todas las actividades
        setActividadesFiltradas(dataAct);
      }

    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el nombre del club
  const getClubNombre = (idClub) => {
    const club = clubes.find(c => c.ID_Club === idClub);
    return club ? club.Nombre : "Sin club asignado";
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenCreate = () => {
    setForm({ Nombre: "", Descripcion: "", Fecha: "", Lugar: "", ID_Club: "", ID_Estado: 1, ID_Usuario: 1 });
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (act) => {
    const fechaFormateada = act.Fecha ? act.Fecha.substring(0, 16) : "";
    setForm({ ...act, Fecha: fechaFormateada });
    setIsEditing(true);
    setOpenModal(true);
    setOpenDetail(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm({ Nombre: "", Descripcion: "", Fecha: "", Lugar: "", ID_Club: "", ID_Estado: 1, ID_Usuario: 1 });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.Nombre || !form.Fecha || !form.ID_Club) return alert("Completa los campos obligatorios");

    const url = isEditing 
      ? `${import.meta.env.VITE_API_URL}/actividad/actualizar_actividad/${form.ID_Actividad}`
      : `${import.meta.env.VITE_API_URL}/actividad/crear_actividad`;
    
    const method = isEditing ? "PUT" : "POST";
    const fechaISO = form.Fecha.length === 16 ? `${form.Fecha}:00` : form.Fecha;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, Fecha: fechaISO })
      });

      if (response.ok) {
        handleCloseModal();
        loadData();
        alert(isEditing ? "Actividad actualizada" : "Actividad creada");
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar");
      }
    } catch (e) { 
      console.error(e);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (actividad) => {
    setActividadToDelete(actividad);
    setOpenDeleteModal(true);
    setOpenDetail(false);
  };

  const handleDelete = async () => {
    if (!actividadToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/actividad/eliminar_actividad/${actividadToDelete.ID_Actividad}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setActividadToDelete(null);
        setOpenDetail(false);
        loadData();
        alert("Actividad eliminada correctamente");
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (e) { 
      console.error(e);
      alert("Error al eliminar la actividad");
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a', color: 'white' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, ml: '260px', p: 4 }}>
        
        {/* ENCABEZADO */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Actividades</Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              {esAdmin() 
                ? 'Gestiona las actividades de los clubes universitarios.' 
                : 'Explora y participa en las actividades de tus clubes.'}
            </Typography>
          </Box>
          
          {esAdmin() && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleOpenCreate} 
              sx={{ bgcolor: '#3b82f6', borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
            >
              AGREGAR ACTIVIDAD
            </Button>
          )}
        </Box>

        {loading ? (
          <LoadingSpinner message="Cargando actividades..." />
        ) : actividadesFiltradas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2 }}>
              {esAdmin() 
                ? "No hay actividades creadas aún." 
                : "No hay actividades disponibles en tus clubes."}
            </Typography>
            {!esAdmin() && (
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Inscríbete en un club para ver sus actividades.
              </Typography>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {actividadesFiltradas.map((act) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={act.ID_Actividad} sx={{ minWidth: '280px' }}>
                <Card 
                  className="activity-card"
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
                      <CalendarMonth sx={{ color: '#3b82f6', fontSize: 30 }} />
                    </Box>
                    
                    <Typography 
                      className="actividad-nombre"
                      variant="h6" 
                      fontWeight="bold"
                      sx={{
                        height: '48px',
                        lineHeight: '24px',
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        mb: 1
                      }}
                    >
                      {act.Nombre}
                    </Typography>
                    
                    {/* Mostrar club si existe */}
                    {act.ID_Club && (
                      <Typography 
                        sx={{
                          fontSize: '12px',
                          color: '#10b981',
                          textAlign: 'center',
                          mb: 2,
                          fontWeight: 500
                        }}
                      >
                        👥 {getClubNombre(act.ID_Club)}
                      </Typography>
                    )}
                    
                    <Box 
                      className="actividad-acciones"
                      sx={{ 
                        mt: 'auto',
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Button 
                        size="small"
                        onClick={() => { setSelectedAct(act); setOpenDetail(true); }} 
                        sx={{ 
                          color: '#3b82f6', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                        }}
                      >
                        VER DETALLES
                      </Button>
                      
                      {esAdmin() && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenEdit(act)} 
                            sx={{ 
                              color: '#94a3b8',
                              '&:hover': { color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => confirmDelete(act)}
                            sx={{ 
                              color: '#ef4444',
                              '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.1)' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* MODAL DE DETALLES */}
      <Modal 
        open={openDetail} 
        onClose={() => setOpenDetail(false)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      >
        <Box sx={{ 
          bgcolor: '#1e293b', 
          width: { xs: '95%', md: 600 }, 
          borderRadius: 6, 
          border: '1px solid rgba(255,255,255,0.1)', 
          position: 'relative', 
          outline: 'none',
          p: 4
        }}>
          {selectedAct && (
            <>
              <IconButton 
                onClick={() => setOpenDetail(false)} 
                sx={{ 
                  position: 'absolute', 
                  right: 12, 
                  top: 12, 
                  color: 'white', 
                  zIndex: 10, 
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <Close />
              </IconButton>
              
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ pr: 5 }}>
                {selectedAct.Nombre}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<Event sx={{ color: 'white !important' }} />} 
                  label={new Date(selectedAct.Fecha).toLocaleString()} 
                  sx={{ bgcolor: '#3b82f6', color: 'white' }} 
                />
                <Chip 
                  icon={<LocationOn sx={{ color: 'white !important' }} />} 
                  label={selectedAct.Lugar} 
                  variant="outlined" 
                  sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }} 
                />
                <Chip 
                  icon={<Group sx={{ color: 'white !important' }} />} 
                  label={getClubNombre(selectedAct.ID_Club)} 
                  sx={{ bgcolor: '#10b981', color: 'white' }} 
                />
              </Box>
              
              <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
                {selectedAct.Descripcion || "Sin descripción disponible."}
              </Typography>
              
              {esAdmin() && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Edit />} 
                    onClick={() => handleOpenEdit(selectedAct)} 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                    }}
                  >
                    EDITAR
                  </Button>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<Delete />} 
                    onClick={() => confirmDelete(selectedAct)}
                    sx={{ 
                      bgcolor: '#ef4444',
                      '&:hover': { bgcolor: '#dc2626' }
                    }}
                  >
                    ELIMINAR
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* MODAL CREAR / EDITAR */}
      <Modal 
        open={openModal} 
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: '#1e293b', 
          p: 4, 
          width: 450, 
          maxWidth: '95%',
          borderRadius: 6, 
          border: '1px solid rgba(255,255,255,0.1)',
          outline: 'none'
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            {isEditing ? "✏️ Editar Actividad" : "🚀 Nueva Actividad"}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              select 
              label="Club" 
              fullWidth 
              variant="filled" 
              value={form.ID_Club} 
              onChange={(e) => setForm({...form, ID_Club: e.target.value})} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                borderRadius: 2,
                '& .MuiSelect-select': { color: 'white' },
                '& .MuiInputLabel-root': { color: '#94a3b8' }
              }}
            >
              {clubes.map((c) => (
                <MenuItem key={c.ID_Club} value={c.ID_Club}>{c.Nombre}</MenuItem>
              ))}
            </TextField>
            
            <TextField 
              label="Nombre" 
              fullWidth 
              variant="filled" 
              value={form.Nombre} 
              onChange={(e) => setForm({...form, Nombre: e.target.value})} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                borderRadius: 2,
                input: { color: 'white' },
                '& .MuiInputLabel-root': { color: '#94a3b8' }
              }} 
            />
            
            <TextField 
              label="Descripción" 
              fullWidth 
              multiline 
              rows={3} 
              variant="filled" 
              value={form.Descripcion} 
              onChange={(e) => setForm({...form, Descripcion: e.target.value})} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                borderRadius: 2,
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: '#94a3b8' }
              }} 
            />
            
            <TextField 
              label="Fecha" 
              type="datetime-local" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              variant="filled" 
              value={form.Fecha} 
              onChange={(e) => setForm({...form, Fecha: e.target.value})} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                borderRadius: 2,
                '& .MuiInputBase-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: '#94a3b8' }
              }} 
            />
            
            <TextField 
              label="Lugar" 
              fullWidth 
              variant="filled" 
              value={form.Lugar} 
              onChange={(e) => setForm({...form, Lugar: e.target.value})} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                borderRadius: 2,
                input: { color: 'white' },
                '& .MuiInputLabel-root': { color: '#94a3b8' }
              }} 
            />
          </Box>
          
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
          maxWidth: '95%',
          borderRadius: 6, 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          outline: 'none' 
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
            ⚠️ Confirmar Eliminación
          </Typography>
          <Typography sx={{ mb: 3, color: '#94a3b8' }}>
            ¿Estás seguro de que deseas eliminar la actividad <strong style={{ color: 'white' }}>"{actividadToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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