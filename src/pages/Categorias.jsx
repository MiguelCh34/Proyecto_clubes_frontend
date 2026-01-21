import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Modal, TextField, Box, Typography,
  Grid, Card, CardContent, IconButton
} from "@mui/material";
import { Add, Delete, Edit, Category as CategoryIcon } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Categorias.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const emptyForm = {
    Nombre: "",
    Descripcion: "",
    ID_Estado: 1
  };

  const [form, setForm] = useState(emptyForm);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categoria/listar_categorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.removeItem("access_token");
        return navigate("/login");
      }
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingCategoria(null);
  };

  const handleSave = async () => {
    if (!form.Nombre.trim()) {
      return alert("El nombre es obligatorio");
    }

    const url = editingCategoria
      ? `${import.meta.env.VITE_API_URL}/categoria/actualizar_categoria/${editingCategoria.ID_Categoria}`
      : `${import.meta.env.VITE_API_URL}/categoria/crear_categoria`;

    try {
      const response = await fetch(url, {
        method: editingCategoria ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        handleCloseModal();
        fetchCategorias();
        alert(editingCategoria ? "Categoría actualizada" : "Categoría creada");
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const confirmDelete = (categoria) => {
    setCategoriaToDelete(categoria);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/categoria/eliminar_categoria/${categoriaToDelete.ID_Categoria}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setOpenDeleteModal(false);
        setCategoriaToDelete(null);
        fetchCategorias();
        alert("Categoría eliminada");
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
    <div className="categorias-container">
      <Sidebar />

      <div className="categorias-main-content">
        
        {/* ENCABEZADO */}
        <div className="categorias-header">
          <div>
            <h1 className="categorias-title">Gestión de Categorías</h1>
            <p className="categorias-subtitle">Clasificación de clubes y actividades.</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditingCategoria(null); setForm(emptyForm); setOpenModal(true); }}
            className="btn-nueva-categoria"
          >
            Nueva Categoría
          </Button>
        </div>

        {/* LISTADO DE TARJETAS */}
        {loading ? (
          <LoadingSpinner message="Cargando categorías..." />
        ) : (
          <Grid container spacing={3}>
            {categorias.map((categoria) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={categoria.ID_Categoria} sx={{ minWidth: '280px' }}>
                <Card className="categoria-card">
                  <CardContent className="categoria-card-content">
                    
                    {/* Icono de la categoría */}
                    <Box
                      className="icon-container"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
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
                      <CategoryIcon sx={{ color: '#10b981', fontSize: 30 }} />
                    </Box>

                    <div className="categoria-card-header">
                      <span className="categoria-id">ID: {categoria.ID_Categoria}</span>
                    </div>

                    <h3 className="categoria-nombre">{categoria.Nombre}</h3>
                    <p className="categoria-descripcion">{categoria.Descripcion || "Sin descripción"}</p>

                    <div className="categoria-actions">
                      <IconButton
                        size="small"
                        onClick={() => { setEditingCategoria(categoria); setForm(categoria); setOpenModal(true); }}
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
                        onClick={() => confirmDelete(categoria)}
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
        className="categorias-modal"
      >
        <Box className="categorias-modal-box">
          <Typography variant="h6" className="modal-title">
            {editingCategoria ? "✏️ Editar Categoría" : "🏷️ Nueva Categoría"}
          </Typography>

          <div className="modal-form">
            <TextField
              fullWidth
              label="Nombre de la Categoría"
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
              {editingCategoria ? 'ACTUALIZAR' : 'GUARDAR'}
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
            ¿Estás seguro de que deseas eliminar la categoría <strong style={{ color: 'white' }}>"{categoriaToDelete?.Nombre}"</strong>? Esta acción no se puede deshacer.
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