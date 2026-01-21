import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Button, Modal, TextField, Box, Typography, Grid,
  Card, CardContent, IconButton, Chip, MenuItem, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { Add, Delete, Edit, Group, CheckCircle, People } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Clubes.css";

export default function Clubes() {
  const { esAdmin, user } = useAuth();
  const [clubes, setClubes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [inscripciones, setInscripciones] = useState({});
  const [inscritosClub, setInscritosClub] = useState({ activos: [], inactivos: [] });
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openInscritosModal, setOpenInscritosModal] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [editingClub, setEditingClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const emptyForm = {
    Nombre: "",
    Descripcion: "",
    Tipo: "",
    Duracion: "",
    ID_Sede: "",
    ID_Facultad: "",
    ID_Estado: 1,
    ID_Usuario: 1,
    ID_Actividad: ""
  };

  const [form, setForm] = useState(emptyForm);

  const isClubActivo = (club) => {
    const estado = estados.find(e => e.ID_Estado === club.ID_Estado);
    return estado?.Nombre_estado?.toLowerCase() === 'activo';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const clubesResponse = await fetch(`${import.meta.env.VITE_API_URL}/club/listar_clubes`, { headers });
      if (clubesResponse.status === 401) {
        localStorage.removeItem("access_token");
        return navigate("/login");
      }
      const clubesData = await clubesResponse.json();
      setClubes(clubesData);

      const sedesResponse = await fetch(`${import.meta.env.VITE_API_URL}/sede/listar_sedes`, { headers });
      const sedesData = await sedesResponse.json();
      setSedes(sedesData);

      const facultadesResponse = await fetch(`${import.meta.env.VITE_API_URL}/facultad/listar_facultades`, { headers });
      const facultadesData = await facultadesResponse.json();
      setFacultades(facultadesData);

      const estadosResponse = await fetch(`${import.meta.env.VITE_API_URL}/estado/listar_estados`, { headers });
      const estadosData = await estadosResponse.json();
      setEstados(estadosData);

      const actividadesResponse = await fetch(`${import.meta.env.VITE_API_URL}/actividad/listar_actividades`, { headers });
      const actividadesData = await actividadesResponse.json();
      setActividades(actividadesData);

      if (!esAdmin()) {
        const inscripcionesMap = {};
        for (const club of clubesData) {
          try {
            const inscripcionResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/inscripcion/verificar_inscripcion/${club.ID_Club}`,
              { headers }
            );
            const inscripcionData = await inscripcionResponse.json();
            inscripcionesMap[club.ID_Club] = inscripcionData.inscrito;
          } catch (error) {
            console.error(`Error verificando inscripción club ${club.ID_Club}:`, error);
          }
        }
        setInscripciones(inscripcionesMap);
      }
      
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingClub(null);
  };

  const handleSave = async () => {
    if (!form.Nombre.trim() || !form.ID_Sede || !form.ID_Estado) {
      return alert("El nombre, sede y estado son obligatorios");
    }

    const url = editingClub
      ? `${import.meta.env.VITE_API_URL}/club/actualizar_club/${editingClub.ID_Club}`
      : `${import.meta.env.VITE_API_URL}/club/crear_club`;

    try {
      const { ID_Actividad, ...clubData } = form;

      const response = await fetch(url, {
        method: editingClub ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(clubData)
      });

      if (response.ok) {
        const clubResponse = await response.json();
        const clubId = editingClub ? editingClub.ID_Club : clubResponse.ID_Club;

        if (form.ID_Actividad) {
          const actividadActual = actividades.find(a => a.ID_Actividad === form.ID_Actividad);
          
          if (actividadActual) {
            await fetch(
              `${import.meta.env.VITE_API_URL}/actividad/actualizar_actividad/${form.ID_Actividad}`,
              {
                method: "PUT",
                headers: { 
                  "Content-Type": "application/json", 
                  Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                  Nombre: actividadActual.Nombre,
                  Descripcion: actividadActual.Descripcion,
                  Fecha: actividadActual.Fecha,
                  Lugar: actividadActual.Lugar,
                  ID_Club: clubId,
                  ID_Estado: actividadActual.ID_Estado,
                  ID_Usuario: actividadActual.ID_Usuario
                })
              }
            );
          }
        }

        handleCloseModal();
        fetchData();
        alert(editingClub ? "Club actualizado correctamente" : "Club creado correctamente");
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar el club");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (club) => {
    setClubToDelete(club);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!clubToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/club/eliminar_club/${clubToDelete.ID_Club}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setClubToDelete(null);
        fetchData();
        alert("Club eliminado correctamente");
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el club");
    }
  };

  const handleInscribirse = async (clubId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inscripcion/inscribirse/${clubId}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        }
      );

      if (response.ok) {
        alert("¡Te has inscrito exitosamente!");
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Error al inscribirse");
      }
    } catch (error) {
      console.error("Error al inscribirse:", error);
      alert("Error de conexión al inscribirse");
    }
  };

  const handleCancelarInscripcion = async (clubId) => {
    if (!confirm("¿Estás seguro de que deseas cancelar tu inscripción?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inscripcion/cancelar_inscripcion/${clubId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert("Inscripción cancelada correctamente");
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Error al cancelar inscripción");
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("Error de conexión");
    }
  };

  const handleVerInscritos = async (club) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inscripcion/club/${club.ID_Club}/inscritos`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInscritosClub(data);
        setClubSeleccionado(club);
        setOpenInscritosModal(true);
      } else {
        const errorData = await response.json();
        alert(`Error al obtener inscritos: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error completo al obtener inscritos:", error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  const getSedeNombre = (id) => sedes.find(s => s.ID_Sede === id)?.Ubicacion || "Sin sede";
  const getEstadoNombre = (id) => estados.find(e => e.ID_Estado === id)?.Nombre_estado || "Desconocido";
  const getActividadDelClub = (clubId) => {
    return actividades.find(act => act.ID_Club === clubId);
  };

  return (
    <div className="clubes-container">
      <Sidebar />

      <div className="clubes-main-content">
        
        <div className="clubes-header">
          <div>
            <h1 className="clubes-title">
              {esAdmin() ? 'Gestión de Clubes' : 'Explorar Clubes'}
            </h1>
            <p className="clubes-subtitle">
              {esAdmin() 
                ? 'Administra y organiza los grupos activos' 
                : 'Descubre y únete a clubes universitarios'}
            </p>
          </div>
          
          {esAdmin() && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => { setEditingClub(null); setForm(emptyForm); setOpenModal(true); }}
              className="btn-nuevo-club"
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Nuevo Club
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando clubes..." />
        ) : (
          <Grid container spacing={3}>
            {clubes.map((club) => {
              const activo = isClubActivo(club);
              const estaInscrito = inscripciones[club.ID_Club];
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={club.ID_Club} sx={{ minWidth: '280px' }}>
                  <Card 
                    sx={{
                      bgcolor: activo ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.3)',
                      color: 'white',
                      borderRadius: '16px',
                      border: activo ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(100, 116, 139, 0.3)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      opacity: activo ? 1 : 0.6,
                      filter: activo ? 'none' : 'grayscale(50%)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: '#3b82f6',
                        boxShadow: '0 8px 24px -8px rgba(59, 130, 246, 0.3)',
                        opacity: 1
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label={club.Tipo || "General"} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(59, 130, 246, 0.2)', 
                            color: '#3b82f6',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }} 
                        />
                        <Chip 
                          label={activo ? "Activo" : "Inactivo"} 
                          size="small" 
                          sx={{ 
                            bgcolor: activo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                            color: activo ? '#10b981' : '#64748b',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>

                      <Box 
                        sx={{
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <Group sx={{ color: '#3b82f6', fontSize: 30 }} />
                      </Box>

                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          textAlign: 'center',
                          mb: 1,
                          color: activo ? 'white' : '#94a3b8'
                        }}
                      >
                        {club.Nombre}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontSize: '13px',
                          textAlign: 'center',
                          mb: 2,
                          height: '40px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2
                        }}
                      >
                        {club.Descripcion || "Sin descripción"}
                      </Typography>

                      <Box sx={{ 
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <Typography sx={{ color: '#64748b', fontSize: '12px', mb: 0.5 }}>
                          📍 {getSedeNombre(club.ID_Sede)}
                        </Typography>
                        {club.Duracion && (
                          <Typography sx={{ color: '#64748b', fontSize: '12px', mb: 0.5 }}>
                            ⏱️ {club.Duracion}
                          </Typography>
                        )}
                        {getActividadDelClub(club.ID_Club) && (
                          <Typography sx={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 500 }}>
                            📅 {getActividadDelClub(club.ID_Club).Nombre}
                          </Typography>
                        )}
                      </Box>
                      
                      {esAdmin() ? (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          gap: '8px', 
                          marginTop: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleVerInscritos(club)}
                            sx={{
                              color: '#10b981',
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              '&:hover': { color: '#059669', bgcolor: 'rgba(16, 185, 129, 0.2)' }
                            }}
                            title="Ver inscritos"
                          >
                            <People fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => { setEditingClub(club); setForm(club); setOpenModal(true); }}
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
                            onClick={() => confirmDelete(club)}
                            sx={{
                              color: '#ef4444',
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.2)' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      ) : (
                        <Box sx={{ mt: 2 }}>
                          {estaInscrito ? (
                            <Button 
                              variant="outlined" 
                              fullWidth
                              startIcon={<CheckCircle />}
                              onClick={() => handleCancelarInscripcion(club.ID_Club)}
                              sx={{ 
                                borderColor: '#10b981',
                                color: '#10b981',
                                '&:hover': { 
                                  borderColor: '#059669',
                                  bgcolor: 'rgba(16, 185, 129, 0.1)'
                                }
                              }}
                            >
                              Inscrito - Cancelar
                            </Button>
                          ) : (
                            <Button 
                              variant="contained" 
                              fullWidth
                              disabled={!activo}
                              onClick={() => handleInscribirse(club.ID_Club)}
                              sx={{ 
                                bgcolor: activo ? '#3b82f6' : 'rgba(100, 116, 139, 0.3)',
                                '&:hover': { bgcolor: activo ? '#2563eb' : 'rgba(100, 116, 139, 0.3)' },
                                '&:disabled': { color: '#64748b' }
                              }}
                            >
                              {activo ? 'Inscribirse' : 'No disponible'}
                            </Button>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      <Modal 
        open={openModal} 
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: '#1e293b',
          p: 4,
          width: 500,
          maxWidth: '95%',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            {editingClub ? "✏️ Editar Club" : "➕ Nuevo Club"}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              fullWidth 
              label="Nombre del Club" 
              variant="filled" 
              value={form.Nombre} 
              onChange={(e) => setForm({...form, Nombre: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                input: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />
            
            <TextField 
              fullWidth 
              label="Descripción" 
              variant="filled" 
              multiline 
              rows={3} 
              value={form.Descripcion} 
              onChange={(e) => setForm({...form, Descripcion: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                textarea: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />
            
            <TextField 
              fullWidth 
              label="Tipo" 
              variant="filled" 
              value={form.Tipo} 
              onChange={(e) => setForm({...form, Tipo: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                input: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />
            
            <TextField 
              fullWidth 
              label="Duración" 
              variant="filled" 
              value={form.Duracion} 
              onChange={(e) => setForm({...form, Duracion: e.target.value})} 
              placeholder="Ej: 6 meses, 1 año"
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                input: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />
            
            <TextField 
              select
              fullWidth 
              label="Sede" 
              variant="filled" 
              value={form.ID_Sede} 
              onChange={(e) => setForm({...form, ID_Sede: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiSelect-select': { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            >
              {sedes.map((sede) => (
                <MenuItem key={sede.ID_Sede} value={sede.ID_Sede}>
                  {sede.Ubicacion}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField 
              select
              fullWidth 
              label="Facultad (Opcional)" 
              variant="filled" 
              value={form.ID_Facultad || ''} 
              onChange={(e) => setForm({...form, ID_Facultad: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiSelect-select': { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            >
              <MenuItem value="">
                <em>Sin facultad</em>
              </MenuItem>
              {facultades.map((facultad) => (
                <MenuItem key={facultad.ID_Facultad} value={facultad.ID_Facultad}>
                  {facultad.Nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField 
              select
              fullWidth 
              label="Estado" 
              variant="filled" 
              value={form.ID_Estado} 
              onChange={(e) => setForm({...form, ID_Estado: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiSelect-select': { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            >
              {estados.map((estado) => (
                <MenuItem key={estado.ID_Estado} value={estado.ID_Estado}>
                  {estado.Nombre_estado}
                </MenuItem>
              ))}
            </TextField>

            <TextField 
              select
              fullWidth 
              label="Actividad (Opcional)" 
              variant="filled" 
              value={form.ID_Actividad || ''} 
              onChange={(e) => setForm({...form, ID_Actividad: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiSelect-select': { color: 'white' },
                label: { color: '#94a3b8' }
              }}
              helperText="Selecciona una actividad para asociar al club"
            >
              <MenuItem value="">
                <em>Sin actividad</em>
              </MenuItem>
              {actividades
                .filter(act => !act.ID_Club || act.ID_Club === editingClub?.ID_Club)
                .map((actividad) => (
                  <MenuItem key={actividad.ID_Actividad} value={actividad.ID_Actividad}>
                    {actividad.Nombre}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              fullWidth 
              onClick={handleCloseModal}
              sx={{ color: '#94a3b8', textTransform: 'none' }}
            >
              Cancelar
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
              {editingClub ? 'ACTUALIZAR' : 'GUARDAR'}
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
            ¿Estás seguro de que deseas eliminar el club <strong style={{ color: 'white' }}>"{clubToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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

      {/* MODAL VER INSCRITOS (ADMIN) */}
      <Modal 
        open={openInscritosModal} 
        onClose={() => setOpenInscritosModal(false)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: '#1e293b', 
          p: 4, 
          width: 800, 
          maxWidth: '95%',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 6, 
          border: '1px solid rgba(255,255,255,0.1)', 
          outline: 'none' 
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            👥 Miembros de {clubSeleccionado?.Nombre}
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>
            ✅ Miembros Activos ({inscritosClub.activos?.length || 0})
          </Typography>
          
          {(!inscritosClub.activos || inscritosClub.activos.length === 0) ? (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 2, mb: 3 }}>
              No hay miembros activos en este club.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Correo</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Carrera</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Rol</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>Fecha Ingreso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inscritosClub.activos.map((inscrito, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: 'white' }}>{inscrito.Nombre_Completo}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{inscrito.Correo}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{inscrito.Carrera}</TableCell>
                      <TableCell sx={{ color: '#10b981' }}>{inscrito.Rol}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>
                        {new Date(inscrito.Fecha_Ingreso).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {inscritosClub.inactivos && inscritosClub.inactivos.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: '#64748b', fontWeight: 'bold', fontSize: '16px' }}>
                📋 Ex-Miembros ({inscritosClub.inactivos.length})
              </Typography>
              
              <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#64748b', fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 'bold' }}>Correo</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 'bold' }}>Carrera</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 'bold' }}>Rol</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 'bold' }}>Fecha Ingreso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inscritosClub.inactivos.map((inscrito, index) => (
                      <TableRow key={index} sx={{ opacity: 0.6 }}>
                        <TableCell sx={{ color: '#94a3b8' }}>{inscrito.Nombre_Completo}</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>{inscrito.Correo}</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>{inscrito.Carrera}</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>{inscrito.Rol}</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>
                          {new Date(inscrito.Fecha_Ingreso).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setOpenInscritosModal(false)}
              sx={{ color: '#94a3b8', textTransform: 'none' }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}