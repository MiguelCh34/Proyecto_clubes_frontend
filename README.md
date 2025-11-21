# Frontend - Gestión de Clubes (React + Vite)

Este frontend consume la API del backend utilizando un sistema de autenticación con JWT, permitiendo control de sesión y acceso solo a rutas protegidas.

---

## 🚀 Tecnologías utilizadas

- React con Vite
- React Router DOM
- Fetch API
- CSS Modules / Material UI

---

## 🧩 Funcionalidades

✔ Login conectado al backend  
✔ Token almacenado en `localStorage`  
✔ Ruta protegida (**Dashboard**)  
✔ Visualización de datos desde API  
✔ CRUD para Clubes (Crear, Listar, Editar, Eliminar)

## ⚙ Configuración

1. Instalar dependencias:

npm install


2. Crear archivo `.env` en la raíz:


VITE_API_URL=http://127.0.0.1:5000

## ▶️ Ejecutar el proyecto

Frontend disponible en: http://localhost:5173

## 🔑 Autenticación

Cuando el usuario inicia sesión correctamente, el token se almacena: localStorage.setItem("access_token", token);

El sistema verifica si existe token para permitir el acceso al Dashboard.

## 🧪 CRUD desde el frontend

El Dashboard permite:

- Crear club
- Listar clubes
- Editar club
- Eliminar club

Todos estos consumen la API usando:

```js
fetch(`${import.meta.env.VITE_API_URL}/club/...`, {
   headers: {
     Authorization: `Bearer ${token}`
   }
})