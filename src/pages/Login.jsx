import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("📌 Intentando iniciar sesión con:", email, password);

    if (!email || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📌 Respuesta del backend:", response);

      const data = await response.json();
      console.log("📌 Datos recibidos:", data);

      if (response.ok) {
        // Guardar token
        localStorage.setItem("access_token", data.access_token);

        console.log("✅ Login exitoso, redirigiendo al dashboard...");
        navigate("/dashboard");
      } else {
        alert(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("❌ Error al conectar con el servidor:", error);
      alert("No se pudo conectar con el servidor. Revisa si está corriendo el backend.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>

        <input
          className="login-input"
          placeholder="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
}
