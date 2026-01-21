import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    console.log("📌 Intentando registrar:", formData);
    setError("");
    
    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          celular: formData.celular,
          password: formData.password
        }),
      });

      console.log("📌 Respuesta del backend:", response);

      const data = await response.json();
      console.log("📌 Datos recibidos:", data);

      if (response.ok) {
        console.log("✅ Registro exitoso");
        setSuccess(true);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.error || data.message || "Error al registrar el usuario");
      }
    } catch (error) {
      console.error("❌ Error al conectar con el servidor:", error);
      setError("No se pudo conectar con el servidor. Revisa si está corriendo el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="register-container-modern">
      {/* Círculos decorativos */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>

      <div className="register-card-modern">
        {/* Header */}
        <div className="register-header">
          <div className="register-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h1 className="register-title-modern">Crear Cuenta</h1>
          <p className="register-subtitle">Regístrate para comenzar</p>
        </div>

        {/* Formulario */}
        <div className="register-form">
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                name="nombre"
                className="form-input"
                placeholder="Juan"
                value={formData.nombre}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
          </div>

          {/* Apellido */}
          <div className="form-group">
            <label className="form-label">Apellido *</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                name="apellido"
                className="form-input"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
          </div>

          {/* Celular */}
          <div className="form-group">
            <label className="form-label">Celular (opcional)</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <input
                type="tel"
                name="celular"
                className="form-input"
                placeholder="0999999999"
                value={formData.celular}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
          </div>

          {/* Confirmar Password */}
          <div className="form-group">
            <label className="form-label">Confirmar contraseña *</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                required
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Mensaje de Éxito */}
          {success && (
            <div className="success-message">
              ¡Registro exitoso! Redirigiendo al login...
            </div>
          )}

          {/* Botón */}
          <button
            className="register-button-modern"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <span>Crear cuenta</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta? <a href="/login" className="login-link">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}