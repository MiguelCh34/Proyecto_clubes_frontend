import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Modal, TextField, Box, Typography,
  Grid, Card, CardContent, IconButton
} from "@mui/material";
import { Add, Delete, Edit, AdminPanelSettings } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Roles.css";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rolToDelete, setRolToDelete] = useState(null);
  const [editingRol, setEditingRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const emptyForm = {
    Nombre: "",
    Descripcion: ""
  };

  const [form, setForm] = useState(emptyForm);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rol/listar_roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        return navigate("/login");
      }
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingRol(null);
  };

  const handleSave = async () => {
    if (!form.Nombre.trim()) {
      return alert("El nombre es obligatorio");
    }

    const url = editingRol
      ? `${import.meta.env.VITE_API_URL}/rol/actualizar_rol/${editingRol.ID_Rol}`
      : `${import.meta.env.VITE_API_URL}/rol/crear_rol`;

    try {
      const response = await fetch(url, {
        method: editingRol ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        handleCloseModal();
        fetchRoles();
        alert(editingRol ? "Rol actualizado" : "Rol creado");
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (rol) => {
    setRolToDelete(rol);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!rolToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rol/eliminar_rol/${rolToDelete.ID_Rol}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setRolToDelete(null);
        fetchRoles();
        alert("Rol eliminado");
      } else {
        const err = await response.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  return (
    <div className="roles-container">
      <Sidebar />

      <div className="roles-main-content">
        
        <div className="roles-header">
          <div>
            <h1 className="roles-title">Gestión de Roles</h1>
            <p className="roles-subtitle">Gestión de roles y permisos del sistema.</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditingRol(null); setForm(emptyForm); setOpenModal(true); }}
            className="btn-nuevo-rol"
          >
            Nuevo Rol
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando roles..." />
        ) : (
          <Grid container spacing={3}>
            {roles.map((rol) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={rol.ID_Rol} sx={{ minWidth: '280px' }}>
                <Card className="rol-card">
                  <CardContent className="rol-card-content">
                    
                    <Box
                      className="icon-container"
                      sx={{
                        bgcolor: 'rgba(168, 85, 247, 0.1)',
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
                      <AdminPanelSettings sx={{ color: '#a855f7', fontSize: 30 }} />
                    </Box>

                    <div className="rol-card-header">
                      <span className="rol-id">ID: {rol.ID_Rol}</span>
                    </div>

                    <h3 className="rol-nombre">{rol.Nombre}</h3>
                    <p className="rol-descripcion">{rol.Descripcion || "Sin descripción"}</p>

                    <div className="rol-actions">
                      <IconButton
                        size="small"
                        onClick={() => { setEditingRol(rol); setForm(rol); setOpenModal(true); }}
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
                        onClick={() => confirmDelete(rol)}
                        sx={{
                          color: '#ef4444',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': { color: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        className="roles-modal"
      >
        <Box className="roles-modal-box">
          <Typography variant="h6" className="modal-title">
            {editingRol ? "✏️ Editar Rol" : "🔐 Nuevo Rol"}
          </Typography>

          <div className="modal-form">
            <TextField
              fullWidth
              label="Nombre del Rol"
              variant="filled"
              value={form.Nombre}
              onChange={(e) => setForm({ ...form, Nombre: e.target.value })}
              className="modal-input"
            />

            <TextField
              fullWidth
              label="Descripción"
              variant="filled"
              multiline
              rows={3}
              value={form.Descripcion}
              onChange={(e) => setForm({ ...form, Descripcion: e.target.value })}
              className="modal-input"
            />
          </div>

          <div className="modal-actions">
            <Button
              fullWidth
              onClick={handleCloseModal}
              className="btn-cancelar"
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              className="btn-guardar"
            >
              {editingRol ? 'ACTUALIZAR' : 'GUARDAR'}
            </Button>
          </div>
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
            ¿Estás seguro de que deseas eliminar el rol <strong style={{ color: 'white' }}>"{rolToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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