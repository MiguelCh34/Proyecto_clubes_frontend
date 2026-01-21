import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Modal, TextField, Box, Typography,
  Grid, Card, CardContent, IconButton
} from "@mui/material";
import { Add, Delete, Edit, Flag } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Estados.css";

export default function Estados() {
  const [estados, setEstados] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [estadoToDelete, setEstadoToDelete] = useState(null);
  const [editingEstado, setEditingEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const emptyForm = {
    Nombre: "",
    Descripcion: ""
  };

  const [form, setForm] = useState(emptyForm);

  const fetchEstados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/estado/listar_estados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        return navigate("/login");
      }
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingEstado(null);
  };

  const handleSave = async () => {
    if (!form.Nombre.trim()) {
      return alert("El nombre es obligatorio");
    }

    const url = editingEstado
      ? `${import.meta.env.VITE_API_URL}/estado/actualizar_estado/${editingEstado.ID_Estado}`
      : `${import.meta.env.VITE_API_URL}/estado/crear_estado`;

    try {
      const response = await fetch(url, {
        method: editingEstado ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        handleCloseModal();
        fetchEstados();
        alert(editingEstado ? "Estado actualizado" : "Estado creado");
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (estado) => {
    setEstadoToDelete(estado);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!estadoToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/estado/eliminar_estado/${estadoToDelete.ID_Estado}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setEstadoToDelete(null);
        fetchEstados();
        alert("Estado eliminado");
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
    <div className="estados-container">
      <Sidebar />

      <div className="estados-main-content">
        
        <div className="estados-header">
          <div>
            <h1 className="estados-title">Gestión de Estados</h1>
            <p className="estados-subtitle">Configuración de estados del sistema.</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditingEstado(null); setForm(emptyForm); setOpenModal(true); }}
            className="btn-nuevo-estado"
          >
            Nuevo Estado
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando estados..." />
        ) : (
          <Grid container spacing={3}>
            {estados.map((estado) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={estado.ID_Estado} sx={{ minWidth: '280px' }}>
                <Card className="estado-card">
                  <CardContent className="estado-card-content">
                    
                    <Box
                      className="icon-container"
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
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
                      <Flag sx={{ color: '#ef4444', fontSize: 30 }} />
                    </Box>

                    <div className="estado-card-header">
                      <span className="estado-id">ID: {estado.ID_Estado}</span>
                    </div>

                    <h3 className="estado-nombre">{estado.Nombre}</h3>
                    <p className="estado-descripcion">{estado.Descripcion || "Sin descripción"}</p>

                    <div className="estado-actions">
                      <IconButton
                        size="small"
                        onClick={() => { setEditingEstado(estado); setForm(estado); setOpenModal(true); }}
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
                        onClick={() => confirmDelete(estado)}
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
        className="estados-modal"
      >
        <Box className="estados-modal-box">
          <Typography variant="h6" className="modal-title">
            {editingEstado ? "✏️ Editar Estado" : "🚩 Nuevo Estado"}
          </Typography>

          <div className="modal-form">
            <TextField
              fullWidth
              label="Nombre del Estado"
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
              {editingEstado ? 'ACTUALIZAR' : 'GUARDAR'}
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
            ¿Estás seguro de que deseas eliminar el estado <strong style={{ color: 'white' }}>"{estadoToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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