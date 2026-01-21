import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box, Typography, Grid, Card, CardContent, Chip, Modal, TextField, MenuItem, Button, IconButton
} from "@mui/material";
import { Person, Email, AdminPanelSettings, Edit, Delete } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Personas.css";

export default function Personas() {
  const { esAdmin, user } = useAuth();
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol_sistema: "usuario", // admin o usuario
    ID_Rol: "" // Coordinador o Estudiante
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Obtener usuarios
      const personasResponse = await fetch(`${import.meta.env.VITE_API_URL}/persona/listar_usuarios`, { headers });
      if (personasResponse.status === 401) {
        localStorage.removeItem("access_token");
        return navigate("/login");
      }
      const usuariosData = await personasResponse.json();
      
      // Obtener roles
      const rolesResponse = await fetch(`${import.meta.env.VITE_API_URL}/rol/listar_roles`, { headers });
      const rolesData = await rolesResponse.json();
      setRoles(rolesData);
      
      // Mapear usuarios a formato de personas
      const usuariosMapeados = usuariosData.map(u => ({
        ID_Usuario: u.ID_Usuario,
        Nombre: u.Nombre,
        Email: u.Email,
        Rol: u.Rol,
        RolLabel: u.Rol === 'admin' ? '👑 Administrador' : '👤 Usuario'
      }));
      
      // Si no es admin, filtrar solo su usuario
      if (!esAdmin()) {
        const miUsuario = usuariosMapeados.filter(p => p.ID_Usuario === user?.id);
        setPersonas(miUsuario);
      } else {
        setPersonas(usuariosMapeados);
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

  const handleOpenEdit = (persona) => {
    setEditingPersona(persona);
    setForm({
      nombre: persona.Nombre,
      email: persona.Email,
      rol_sistema: persona.Rol,
      ID_Rol: ""
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPersona(null);
    setForm({
      nombre: "",
      email: "",
      rol_sistema: "usuario",
      ID_Rol: ""
    });
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      return alert("El nombre y email son obligatorios");
    }

    try {
      // Actualizar usuario en la tabla usuario
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/actualizar_usuario/${editingPersona.ID_Usuario}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            nombre: form.nombre,
            email: form.email,
            rol: form.rol_sistema
          })
        }
      );

      if (response.ok) {
        // Si se seleccionó un rol adicional (Coordinador/Estudiante), crear/actualizar en tabla persona
        if (form.ID_Rol) {
          await fetch(`${import.meta.env.VITE_API_URL}/persona/asignar_rol`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
              ID_Usuario: editingPersona.ID_Usuario,
              Nombre: form.nombre.split(' ')[0],
              Apellido: form.nombre.split(' ').slice(1).join(' ') || '',
              Correo_institucional: form.email,
              ID_Rol: form.ID_Rol,
              ID_Estado: 1
            })
          });
        }

        handleCloseModal();
        fetchData();
        alert("Usuario actualizado correctamente");
      } else {
        const err = await response.json();
        alert(err.error || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (persona) => {
    setPersonaToDelete(persona);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!personaToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/eliminar_usuario/${personaToDelete.ID_Usuario}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setPersonaToDelete(null);
        fetchData();
        alert("Usuario eliminado correctamente");
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el usuario");
    }
  };

  return (
    <div className="personas-container">
      <Sidebar />

      <div className="personas-main-content">
        
        <div className="personas-header">
          <div>
            <h1 className="personas-title">
              {esAdmin() ? 'Usuarios Registrados' : 'Mi Perfil'}
            </h1>
            <p className="personas-subtitle">
              {esAdmin() 
                ? 'Gestiona usuarios y asigna roles del sistema' 
                : 'Tu información personal'}
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando usuarios..." />
        ) : personas.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: '#94a3b8'
          }}>
            <Person sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">
              No hay usuarios registrados
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {personas.map((persona) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={persona.ID_Usuario} sx={{ minWidth: '280px' }}>
                <Card 
                  sx={{
                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                    color: 'white',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#14b8a6',
                      boxShadow: '0 8px 24px -8px rgba(20, 184, 166, 0.3)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    <Box 
                      sx={{
                        bgcolor: persona.Rol === 'admin'
                          ? 'rgba(168, 85, 247, 0.1)' 
                          : 'rgba(20, 184, 166, 0.1)',
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
                      {persona.Rol === 'admin' ? (
                        <AdminPanelSettings sx={{ color: '#a855f7', fontSize: 30 }} />
                      ) : (
                        <Person sx={{ color: '#14b8a6', fontSize: 30 }} />
                      )}
                    </Box>

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        textAlign: 'center',
                        mb: 0.5,
                        color: 'white'
                      }}
                    >
                      {persona.Nombre}
                    </Typography>

                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#64748b',
                        mb: 2
                      }}
                    >
                      ID: {persona.ID_Usuario}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Email sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <Typography sx={{ fontSize: '13px', color: '#94a3b8', wordBreak: 'break-all' }}>
                        {persona.Email}
                      </Typography>
                    </Box>

                    <Chip 
                      label={persona.RolLabel} 
                      size="small" 
                      sx={{ 
                        mt: 'auto',
                        mb: 2,
                        bgcolor: persona.Rol === 'admin'
                          ? 'rgba(168, 85, 247, 0.2)' 
                          : 'rgba(20, 184, 166, 0.2)',
                        color: persona.Rol === 'admin'
                          ? '#a855f7' 
                          : '#14b8a6',
                        fontSize: '11px',
                        mx: 'auto',
                        fontWeight: 'bold'
                      }} 
                    />

                    {esAdmin() && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(persona)}
                          sx={{
                            color: '#94a3b8',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': { color: '#14b8a6', bgcolor: 'rgba(20, 184, 166, 0.1)' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => confirmDelete(persona)}
                          sx={{
                            color: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.2)' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* MODAL EDITAR */}
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
          outline: 'none'
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            ✏️ Editar Usuario
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField 
              fullWidth 
              label="Nombre" 
              variant="filled" 
              value={form.nombre} 
              onChange={(e) => setForm({...form, nombre: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                input: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />
            
            <TextField 
              fullWidth 
              label="Email" 
              variant="filled"
              type="email"
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                input: { color: 'white' },
                label: { color: '#94a3b8' }
              }}
            />

            <Box>
              <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                Rol del Sistema
              </Typography>
              <TextField 
                select
                fullWidth 
                variant="filled" 
                value={form.rol_sistema} 
                onChange={(e) => setForm({...form, rol_sistema: e.target.value})} 
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiSelect-select': { color: 'white' },
                  label: { color: '#94a3b8' }
                }}
              >
                <MenuItem value="usuario">👤 Usuario</MenuItem>
                <MenuItem value="admin">👑 Administrador</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                Rol Adicional (Opcional)
              </Typography>
              <TextField 
                select
                fullWidth 
                variant="filled" 
                value={form.ID_Rol} 
                onChange={(e) => setForm({...form, ID_Rol: e.target.value})} 
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiSelect-select': { color: 'white' },
                  label: { color: '#94a3b8' }
                }}
                helperText="Asigna un rol como Coordinador o Estudiante"
              >
                <MenuItem value="">
                  <em>Sin rol adicional</em>
                </MenuItem>
                {roles.map((rol) => (
                  <MenuItem key={rol.ID_Rol} value={rol.ID_Rol}>
                    {rol.Nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
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
                bgcolor: '#14b8a6',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#0d9488' }
              }}
            >
              ACTUALIZAR
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
            ¿Estás seguro de que deseas eliminar al usuario <strong style={{ color: 'white' }}>"{personaToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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
    </div>
  );
}