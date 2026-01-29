# 🎨 UniClubs Frontend - Interfaz de Usuario

Frontend del sistema de gestión de clubes universitarios. Aplicación React desplegada en Vercel.

---

## 🌐 Producción

**URL:** https://proyecto-clubes-web-ii.vercel.app

**Estado:** ✅ En producción

**Plataforma:** Vercel (Hobby Plan)

**CDN:** Global Edge Network

---

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Características](#-características)
- [Instalación Local](#-instalación-local)
- [Configuración](#-configuración)
- [Deployment en Vercel](#-deployment-en-vercel)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)

---

## 🛠️ Tecnologías

- **React** 18.3.1 - Librería UI
- **Vite** 6.0.5 - Build tool y dev server
- **React Router** 6.29.0 - Enrutamiento
- **CSS3** - Estilos modernos y responsive
- **Vercel** - Plataforma de hosting

---

## ✨ Características

### Para Usuarios

- 🔐 **Autenticación JWT** - Login y registro seguros
- 🎯 **Explorar Clubes** - Ver todos los clubes disponibles
- 📅 **Actividades** - Ver y participar en actividades
- 👤 **Perfil Personal** - Gestionar información y avatar
- 📝 **Inscripciones** - Unirse y salir de clubes
- 🖼️ **Avatares Personalizables** - Sistema de avatares con DiceBear

### Para Administradores

- ➕ **Gestión de Clubes** - Crear, editar, eliminar clubes
- 📊 **Panel de Control** - Dashboard con estadísticas
- 👥 **Gestión de Usuarios** - Administrar personas
- ⚙️ **Configuración** - Estados, roles, facultades, sedes

---

## 💻 Instalación Local

### Requisitos

- Node.js 18+
- npm 9+
- Git

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/MiguelCh34/Proyecto_clubes_frontend.git
cd Proyecto_clubes_frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env

# 4. Ejecutar en desarrollo
npm run dev

# La app estará en: http://localhost:5173
```

---

## 🔐 Configuración

### Variables de Entorno

#### Desarrollo (.env)

```env
VITE_API_URL=http://localhost:5000
```

#### Producción (Vercel)

En Vercel → Settings → Environment Variables:

```env
VITE_API_URL=https://uniclubs-backend.onrender.com
```

### Archivo vercel.json

**IMPORTANTE:** Necesario para que React Router funcione correctamente.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Este archivo redirige todas las rutas a `index.html` para que React Router maneje el routing del lado del cliente.

---

## 🚀 Deployment en Vercel

### Configuración del Proyecto

1. **Importar proyecto** desde GitHub
2. **Seleccionar repositorio:** `Proyecto_clubes_frontend`
3. **Framework Preset:** Vite
4. **Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Variables de entorno:**
   ```
   VITE_API_URL=https://uniclubs-backend.onrender.com
   ```

### Auto-Deploy

- ✅ Activado por defecto
- Cada push a `main` despliega automáticamente
- Preview deployments para pull requests
- Tiempo de deploy: ~1 minuto

### Dominios

**Principal:** proyecto-clubes-web-ii.vercel.app

**Puedes agregar dominio personalizado:**
1. Settings → Domains
2. Agregar tu dominio
3. Configurar DNS

---

## 📁 Estructura del Proyecto

```
Proyecto_clubes_frontend/
├── index.html            # HTML principal
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
├── vercel.json           # Configuración de Vercel (importante)
├── .env.example          # Template de variables de entorno
├── .gitignore            # Archivos ignorados
│
├── public/               # Archivos estáticos
│   └── imagenes/         # Imágenes del proyecto
│
└── src/
    ├── main.jsx          # Punto de entrada
    ├── App.jsx           # Componente raíz
    │
    ├── routes/
    │   └── AppRoutes.jsx # Configuración de rutas
    │
    ├── pages/            # Páginas principales
    │   ├── Login.jsx     # Inicio de sesión
    │   ├── Register.jsx  # Registro de usuarios
    │   ├── Dashboard.jsx # Panel principal
    │   ├── Clubes.jsx    # Gestión de clubes
    │   ├── Actividades.jsx  # Gestión de actividades
    │   ├── MiPerfil.jsx  # Perfil del usuario
    │   ├── Personas.jsx  # Gestión de personas (admin)
    │   ├── Estados.jsx   # Configuración de estados
    │   ├── Roles.jsx     # Configuración de roles
    │   ├── Facultad.jsx  # Gestión de facultades
    │   └── Sedes.jsx     # Gestión de sedes
    │
    ├── components/       # Componentes reutilizables
    │   ├── Navbar.jsx    # Barra de navegación
    │   ├── Footer.jsx    # Pie de página
    │   └── ProtectedRoute.jsx  # HOC para rutas protegidas
    │
    └── styles/           # Estilos CSS
        ├── Login.css
        ├── Dashboard.css
        ├── Clubes.css
        └── ... (15+ archivos CSS)
```

---

## 🧩 Componentes Principales

### Autenticación

```jsx
// Login.jsx
- Formulario de inicio de sesión
- Validación de credenciales
- Almacenamiento de token JWT en localStorage
- Redirección al dashboard

// Register.jsx
- Formulario de registro
- Validación de campos
- Creación de usuario y persona
```

### Dashboard

```jsx
// Dashboard.jsx
- Bienvenida personalizada
- Tarjetas de navegación
- Panel diferenciado por rol (usuario/admin)
- Estadísticas del sistema
```

### Gestión de Clubes

```jsx
// Clubes.jsx
- Lista de clubes con filtros
- Modal para crear/editar club (admin)
- Botón de inscripción (usuarios)
- Vista detallada de club
```

### Perfil de Usuario

```jsx
// MiPerfil.jsx
- Información personal
- Selector de avatar (DiceBear API)
- Edición de datos
- Lista de inscripciones
```

### Rutas Protegidas

```jsx
// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
```

---

## 🔒 Gestión de Autenticación

### Login Flow

```javascript
// 1. Usuario ingresa credenciales
const response = await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

// 2. Backend responde con token
const data = await response.json();

// 3. Guardar token en localStorage
localStorage.setItem("token", data.access_token);
localStorage.setItem("usuario", JSON.stringify(data.usuario));

// 4. Redirigir a dashboard
navigate("/dashboard");
```

### Peticiones Autenticadas

```javascript
const token = localStorage.getItem("token");

const response = await fetch(`${API_URL}/endpoint`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Logout

```javascript
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  navigate("/");
};
```

---

## 🎨 Sistema de Avatares

Utiliza **DiceBear API** para generar avatares únicos:

```javascript
const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre}`;
```

**Características:**
- Generación basada en el nombre (seed)
- Mismo nombre = mismo avatar (consistente)
- Sin almacenamiento de imágenes
- 10 opciones predefinidas en el selector

---

## 🎨 Estilos

### CSS Modular

Cada página tiene su propio archivo CSS:
- `Login.css` - Estilos de login
- `Dashboard.css` - Dashboard
- `Clubes.css` - Gestión de clubes
- etc.

### Diseño Responsive

```css
/* Mobile First */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Tablet y Desktop */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

---

## 🔧 Scripts Disponibles

```json
{
  "scripts": {
    "dev": "vite",                    // Servidor de desarrollo
    "build": "vite build",            // Build de producción
    "preview": "vite preview"         // Preview del build
  }
}
```

---

## 🐛 Debugging

### Desarrollo Local

```bash
# Ver errores en consola del navegador
npm run dev

# Abrir: http://localhost:5173
# DevTools (F12) → Console
```

### Producción (Vercel)

```
Vercel Dashboard → Proyecto → Deployments → Ver logs
```

---

## 📱 Responsive Design

La aplicación es completamente responsive:

- 📱 **Mobile:** 320px - 767px
- 📱 **Tablet:** 768px - 1023px
- 💻 **Desktop:** 1024px+

---

## 🧪 Testing

```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react vitest

# Ejecutar tests
npm run test
```

---

## 🚨 Problemas Comunes

### 1. Error 404 en rutas

**Problema:** Al refrescar la página en una ruta (ej: /clubes) da 404

**Solución:** Verificar que `vercel.json` existe con:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. API no responde

**Problema:** Error de CORS o conexión

**Solución:** Verificar que `VITE_API_URL` apunta al backend correcto

### 3. Token expirado

**Problema:** Usuario pierde sesión

**Solución:** Implementar refresh token o aumentar tiempo de expiración

---

## 📚 Recursos Adicionales

- **Backend API:** https://github.com/MiguelCh34/Proyecto_clubes_backend
- **Docker Setup:** https://github.com/MiguelCh34/Proyecto_clubes_docker
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Vercel Docs:** https://vercel.com/docs

---

## 👨‍💻 Autor

**Miguel Chiriboga**
- GitHub: [@MiguelCh34](https://github.com/MiguelCh34)
- Email: miguelchiriboga2002@hotmail.com

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa los logs en Vercel
2. Verifica la consola del navegador (F12)
3. Asegúrate que el backend esté online
4. Consulta la documentación
5. Abre un issue en GitHub

---

**App Status:** ✅ Online at https://proyecto-clubes-web-ii.vercel.app