import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('access_token');
      const rol = localStorage.getItem('user_rol');
      const nombre = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');

      if (token && rol) {
        setUser({
          id: parseInt(id),
          token,
          rol,
          nombre,
          email
        });
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const login = (userData) => {
    const { access_token, usuario } = userData;
    
    // Guardar en localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_rol', usuario.rol);
    localStorage.setItem('user_name', usuario.nombre);
    localStorage.setItem('user_email', usuario.email);
    localStorage.setItem('user_id', usuario.id);
    
    // Actualizar estado
    setUser({
      id: usuario.id,
      token: access_token,
      rol: usuario.rol,
      nombre: usuario.nombre,
      email: usuario.email
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    
    setUser(null);
    navigate('/login');
  };

  // Verificadores de rol
  const esAdmin = () => user?.rol === 'admin';
  const esUsuario = () => user?.rol === 'usuario';
  const estaAutenticado = () => !!user;

  const value = {
    user,
    loading,
    login,
    logout,
    esAdmin,
    esUsuario,
    estaAutenticado
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
};