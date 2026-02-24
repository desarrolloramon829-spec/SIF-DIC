import axios from 'axios';
import type {
  HechoFluvial,
  HechoFormData,
  LoginResponse,
  Usuario,
  Stats,
  FiltrosHechos,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sif_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sif_token');
      localStorage.removeItem('sif_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  getMe: async (): Promise<Usuario> => {
    const { data } = await api.get<Usuario>('/auth/me');
    return data;
  },

  register: async (userData: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }): Promise<any> => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getUsers: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>('/auth/users');
    return data;
  },

  toggleUserActive: async (id: number): Promise<Usuario> => {
    const { data } = await api.patch<Usuario>(`/auth/users/${id}/toggle`);
    return data;
  },
};

// ============ HECHOS ============

export const hechosApi = {
  getAll: async (filtros?: FiltrosHechos): Promise<HechoFluvial[]> => {
    const params: Record<string, string> = {};
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    const { data } = await api.get<HechoFluvial[]>('/hechos', { params });
    return data;
  },

  getById: async (id: number): Promise<HechoFluvial> => {
    const { data } = await api.get<HechoFluvial>(`/hechos/${id}`);
    return data;
  },

  create: async (hecho: HechoFormData): Promise<HechoFluvial> => {
    const { data } = await api.post<HechoFluvial>('/hechos', hecho);
    return data;
  },

  update: async (id: number, hecho: HechoFormData): Promise<HechoFluvial> => {
    const { data } = await api.put<HechoFluvial>(`/hechos/${id}`, hecho);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/hechos/${id}`);
  },

  getStats: async (filtros?: FiltrosHechos): Promise<Stats> => {
    const params: Record<string, string> = {};
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    const { data } = await api.get<Stats>('/hechos/stats', { params });
    return data;
  },

  exportCSV: async (filtros?: FiltrosHechos): Promise<void> => {
    const params: Record<string, string> = {};
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    const response = await api.get('/hechos/export', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    );
    const link = document.createElement('a');
    link.href = url;
    const fecha = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `intervenciones_sumersion_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default api;
