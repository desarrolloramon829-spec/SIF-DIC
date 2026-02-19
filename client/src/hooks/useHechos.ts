import { useState, useEffect, useCallback } from 'react';
import type { HechoFluvial, FiltrosHechos, Stats } from '../types';
import { hechosApi } from '../services/api';

export function useHechos() {
  const [hechos, setHechos] = useState<HechoFluvial[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosHechos>({});

  const fetchHechos = useCallback(async (f?: FiltrosHechos) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hechosApi.getAll(f || filtros);
      setHechos(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar hechos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await hechosApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  useEffect(() => {
    fetchHechos();
    fetchStats();
  }, [fetchHechos, fetchStats]);

  const applyFiltros = (newFiltros: FiltrosHechos) => {
    setFiltros(newFiltros);
    fetchHechos(newFiltros);
  };

  const refresh = () => {
    fetchHechos();
    fetchStats();
  };

  return { hechos, stats, loading, error, filtros, applyFiltros, refresh };
}
