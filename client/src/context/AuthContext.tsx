import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario, Rol } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Rol[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sif_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('sif_token');
          localStorage.removeItem('sif_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('sif_token', response.token);
    localStorage.setItem('sif_user', JSON.stringify(response.usuario));
    setToken(response.token);
    setUser(response.usuario);
  };

  const logout = () => {
    localStorage.removeItem('sif_token');
    localStorage.removeItem('sif_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: Rol[]) => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
