import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Avatar, Button,
  TextField, Grid, IconButton, Modal, Chip, Divider,
  List, ListItem, ListItemText, ListItemIcon, Alert
} from "@mui/material";
import {
  Edit, PhotoCamera, Lock, Group
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MiPerfil() {
  const { user, esAdmin } = useAuth(); // ← Agregado esAdmin
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [perfil, setPerfil] = useState(null);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [openAvatarModal, setOpenAvatarModal] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [formPerfil, setFormPerfil] = useState({
    Nombre: "",
    Apellido: "",
    Carrera: "",
    Correo_institucional: ""
  });

  const [formPassword, setFormPassword] = useState({
    contrasena_actual: "",
    contrasena_nueva: "",
    confirmar_contrasena: ""
  });

  const [avatarUrl, setAvatarUrl] = useState("");

  // Avatares predefinidos
  const avatares = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Adv1",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Adv2"
  ];

  // Estilos comunes para TextField
  const textFieldStyles = {
    '& .MuiFilledInput-root': {
      bgcolor: 'rgba(255,255,255,0.05)',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
      '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.1)' }
    },
    '& .MuiFilledInput-input': { color: 'white' },
    '& .MuiInputLabel-root': { color: '#94a3b8' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar perfil
      const resPerfil = await fetch(
        `${import.meta.env.VITE_API_URL}/persona/obtener_perfil`,
        { headers }
      );
      if (resPerfil.ok) {
        const dataPerfil = await resPerfil.json();
        setPerfil(dataPerfil);
        setFormPerfil({
          Nombre: dataPerfil.Nombre || "",
          Apellido: dataPerfil.Apellido || "",
          Carrera: dataPerfil.Carrera || "",
          Correo_institucional: dataPerfil.Correo_institucional || ""
        });
        setAvatarUrl(dataPerfil.Foto_Perfil || avatares[0]);
      }

      // Cargar inscripciones SOLO si NO es admin
      if (!esAdmin()) {
        const resInscripciones = await fetch(
          `${import.meta.env.VITE_API_URL}/inscripcion/mis_inscripciones`,
          { headers }
        );
        if (resInscripciones.ok) {
          const dataInscripciones = await resInscripciones.json();
          setMisInscripciones(dataInscripciones);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleActualizarPerfil = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/persona/actualizar_perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formPerfil)
        }
      );

      if (response.ok) {
        setMensaje({ texto: "Perfil actualizado exitosamente", tipo: "success" });
        setOpenEditModal(false);
        cargarDatos();
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      } else {
        const err = await response.json();
        setMensaje({ texto: err.error || "Error al actualizar", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
  };

  const handleCambiarContrasena = async () => {
    if (formPassword.contrasena_nueva !== formPassword.confirmar_contrasena) {
      setMensaje({ texto: "Las contraseñas no coinciden", tipo: "error" });
      return;
    }

    if (formPassword.contrasena_nueva.length < 6) {
      setMensaje({ texto: "La contraseña debe tener al menos 6 caracteres", tipo: "error" });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/cambiar_contrasena`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            contrasena_actual: formPassword.contrasena_actual,
            contrasena_nueva: formPassword.contrasena_nueva
          })
        }
      );

      if (response.ok) {
        setMensaje({ texto: "Contraseña actualizada exitosamente", tipo: "success" });
        setOpenPasswordModal(false);
        setFormPassword({ contrasena_actual: "", contrasena_nueva: "", confirmar_contrasena: "" });
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      } else {
        const err = await response.json();
        setMensaje({ texto: err.error || "Error al cambiar contraseña", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    }
  };

  const handleActualizarAvatar = async (url) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/persona/actualizar_foto_perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ foto_perfil: url })
        }
      );

      if (response.ok) {
        setAvatarUrl(url);
        setOpenAvatarModal(false);
        setMensaje({ texto: "Foto de perfil actualizada", tipo: "success" });
        cargarDatos();
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      }
    } catch (error) {
      setMensaje({ texto: "Error al actualizar foto", tipo: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, ml: '260px', p: 4 }}>
          <LoadingSpinner message="Cargando perfil..." />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a', color: 'white' }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1, ml: '260px', p: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>
          Mi Perfil
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
          Tu información personal
        </Typography>

        {mensaje.texto && (
          <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
            {mensaje.texto}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* TARJETA DE PERFIL */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    src={avatarUrl}
                    sx={{ width: 120, height: 120, mx: 'auto', border: '4px solid #3b82f6' }}
                  />
                  <IconButton
                    onClick={() => setOpenAvatarModal(true)}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#3b82f6',
                      color: 'white',
                      '&:hover': { bgcolor: '#2563eb' }
                    }}
                    size="small"
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5, color: 'white' }}>
                  {perfil?.Nombre} {perfil?.Apellido}
                </Typography>

                <Chip
                  label={esAdmin() ? "Administrador" : "Usuario"}
                  size="small"
                  sx={{ 
                    bgcolor: esAdmin() ? '#ef4444' : '#10b981', 
                    color: 'white', 
                    mb: 2 
                  }}
                />

                <Typography sx={{ color: '#94a3b8', fontSize: '14px', mb: 1 }}>
                  📧 {perfil?.Correo_institucional}
                </Typography>

                {perfil?.Carrera && (
                  <Typography sx={{ color: '#94a3b8', fontSize: '14px' }}>
                    🎓 {perfil.Carrera}
                  </Typography>
                )}

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setOpenEditModal(true)}
                  sx={{
                    mb: 2,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                >
                  Editar Perfil
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setOpenPasswordModal(true)}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* CLUBES O PANEL ADMIN */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                {!esAdmin() ? (
                  <>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
                      🏆 Mis Clubes
                    </Typography>

                    {misInscripciones.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: '#94a3b8', mb: 2 }}>
                          Aún no estás inscrito en ningún club
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => navigate('/clubes')}
                          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                          Explorar Clubes
                        </Button>
                      </Box>
                    ) : (
                      <List>
                        {misInscripciones.map((insc, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.03)',
                              borderRadius: 2,
                              mb: 2,
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}
                          >
                            <ListItemIcon>
                              <Group sx={{ color: '#3b82f6' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography fontWeight="bold" sx={{ color: 'white' }}>
                                  {insc.Nombre_Club}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography sx={{ color: '#94a3b8', fontSize: '13px' }}>
                                    {insc.Descripcion || "Club universitario"}
                                  </Typography>
                                  <Chip
                                    label={insc.Rol}
                                    size="small"
                                    sx={{
                                      bgcolor: '#10b981',
                                      color: 'white',
                                      fontSize: '11px',
                                      height: '20px',
                                      mt: 1
                                    }}
                                  />
                                  <Typography sx={{ color: '#64748b', fontSize: '12px', mt: 1 }}>
                                    📅 Inscrito: {new Date(insc.Fecha_Ingreso).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
                      👨‍💼 Panel de Administración
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ color: '#94a3b8', mb: 3 }}>
                        Como administrador, tienes acceso completo a todas las funciones del sistema
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/clubes')}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                            }}
                          >
                            Gestionar Clubes
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/personas')}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                            }}
                          >
                            Gestionar Personas
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/actividades')}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                            }}
                          >
                            Gestionar Actividades
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/dashboard')}
                            sx={{
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.2)',
                              '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                            }}
                          >
                            Ver Dashboard
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* MODAL EDITAR PERFIL */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: '#1e293b',
          p: 4,
          width: 500,
          maxWidth: '95%',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          outline: 'none'
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
            ✏️ Editar Perfil
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              variant="filled"
              value={formPerfil.Nombre}
              onChange={(e) => setFormPerfil({ ...formPerfil, Nombre: e.target.value })}
              sx={textFieldStyles}
            />

            <TextField
              label="Apellido"
              fullWidth
              variant="filled"
              value={formPerfil.Apellido}
              onChange={(e) => setFormPerfil({ ...formPerfil, Apellido: e.target.value })}
              sx={textFieldStyles}
            />

            <TextField
              label="Carrera"
              fullWidth
              variant="filled"
              value={formPerfil.Carrera}
              onChange={(e) => setFormPerfil({ ...formPerfil, Carrera: e.target.value })}
              sx={textFieldStyles}
            />

            <TextField
              label="Correo Institucional"
              fullWidth
              variant="filled"
              type="email"
              value={formPerfil.Correo_institucional}
              onChange={(e) => setFormPerfil({ ...formPerfil, Correo_institucional: e.target.value })}
              sx={textFieldStyles}
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              onClick={() => setOpenEditModal(false)}
              sx={{ color: '#94a3b8' }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleActualizarPerfil}
              sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <Modal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: '#1e293b',
          p: 4,
          width: 500,
          maxWidth: '95%',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          outline: 'none'
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
            🔒 Cambiar Contraseña
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Contraseña Actual"
              fullWidth
              type="password"
              variant="filled"
              value={formPassword.contrasena_actual}
              onChange={(e) => setFormPassword({ ...formPassword, contrasena_actual: e.target.value })}
              sx={textFieldStyles}
            />

            <TextField
              label="Contraseña Nueva"
              fullWidth
              type="password"
              variant="filled"
              value={formPassword.contrasena_nueva}
              onChange={(e) => setFormPassword({ ...formPassword, contrasena_nueva: e.target.value })}
              sx={textFieldStyles}
            />

            <TextField
              label="Confirmar Contraseña"
              fullWidth
              type="password"
              variant="filled"
              value={formPassword.confirmar_contrasena}
              onChange={(e) => setFormPassword({ ...formPassword, confirmar_contrasena: e.target.value })}
              sx={textFieldStyles}
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              onClick={() => setOpenPasswordModal(false)}
              sx={{ color: '#94a3b8' }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCambiarContrasena}
              sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
            >
              Cambiar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* MODAL SELECCIONAR AVATAR */}
      <Modal
        open={openAvatarModal}
        onClose={() => setOpenAvatarModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          bgcolor: '#1e293b',
          p: 4,
          width: 600,
          maxWidth: '95%',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          outline: 'none'
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'white' }}>
            📸 Selecciona tu Avatar
          </Typography>

          <Grid container spacing={2}>
            {avatares.map((url, index) => (
              <Grid item xs={4} sm={3} md={2.4} key={index}>
                <Avatar
                  src={url}
                  onClick={() => handleActualizarAvatar(url)}
                  sx={{
                    width: 80,
                    height: 80,
                    cursor: 'pointer',
                    border: avatarUrl === url ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      border: '3px solid #3b82f6'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Button
            fullWidth
            onClick={() => setOpenAvatarModal(false)}
            sx={{ mt: 3, color: '#94a3b8' }}
          >
            Cerrar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}