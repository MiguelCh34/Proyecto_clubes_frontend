import { useState, useEffect } from "react";
import {
  Button, Modal, TextField, Box, Typography,
  Table, TableRow, TableHead, TableBody, TableCell
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [clubes, setClubes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const emptyForm = {
    Nombre: "",
    Descripcion: "",
    Tipo: "General",
    Duracion: "6 meses",
    ID_Sede: "",
    ID_Facultad: 1,
    ID_Estado: 1,
    ID_Usuario: 1,
  };

  const [form, setForm] = useState(emptyForm);

  const fetchClubes = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/club/listar_clubes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      alert("Sesión expirada");
      localStorage.removeItem("access_token");
      return navigate("/login");
    }

    setClubes(await response.json());
  };

  useEffect(() => {
    fetchClubes();
  }, []);

  const handleSave = async () => {
    const url = editingClub
      ? `${import.meta.env.VITE_API_URL}/club/actualizar_club/${editingClub.ID_Club}`
      : `${import.meta.env.VITE_API_URL}/club/crear_club`;

    const method = editingClub ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (!response.ok) return alert(data.error || "Error al guardar");

    alert(editingClub ? "Club actualizado" : "Club creado");
    setEditingClub(null);
    setOpenModal(false);
    fetchClubes();
  };

  const deleteClub = async (id) => {
    if (!confirm("¿Seguro de eliminar este club?")) return;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/club/eliminar_club/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      alert("Club eliminado");
      fetchClubes();
    } else {
      alert("No se pudo eliminar");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button variant="contained" onClick={() => {
        setEditingClub(null);
        setForm(emptyForm);
        setOpenModal(true);
      }}>
        + Agregar Club
      </Button>

      <Table sx={{ marginTop: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Sede</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {clubes.map((club) => (
            <TableRow key={club.ID_Club}>
              <TableCell>{club.ID_Club}</TableCell>
              <TableCell>{club.Nombre}</TableCell>
              <TableCell>{club.Descripcion}</TableCell>
              <TableCell>{club.ID_Sede}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => {
                  setEditingClub(club);
                  setForm(club);
                  setOpenModal(true);
                }}>Editar</Button>

                <Button size="small" color="error" onClick={() => deleteClub(club.ID_Club)}>
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* MODAL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ background: "white", padding: 3, width: 400, margin: "auto", mt: 15, borderRadius: 2 }}>
          <Typography variant="h6">
            {editingClub ? "Editar Club" : "Crear Club"}
          </Typography>

          {Object.keys(form).map((field) => (
            <TextField
              key={field}
              fullWidth
              label={field.replace(/_/g, " ")}
              margin="normal"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}

          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
