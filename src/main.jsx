import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ← AGREGAR
import App from "./App.jsx";
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>  {/* ← AGREGAR */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>  {/* ← AGREGAR */}
  </React.StrictMode>
);