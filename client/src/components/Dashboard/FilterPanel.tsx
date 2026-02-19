import { useState } from 'react';
import type { FiltrosHechos, CaratulaTipo, UnidadRegional } from '../../types';
import { CARATULA_LABELS } from '../../types';

interface FilterPanelProps {
  filtros: FiltrosHechos;
  onApply: (filtros: FiltrosHechos) => void;
}

export default function FilterPanel({ filtros, onApply }: FilterPanelProps) {
  const [local, setLocal] = useState<FiltrosHechos>(filtros);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply(local);
  };

  const handleClear = () => {
    const empty: FiltrosHechos = {};
    setLocal(empty);
    onApply(empty);
  };

  const hasFilters = Object.values(local).some(v => v);

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setExpanded(!expanded)}>
        <h3>
          🔍 Filtros
          {hasFilters && <span className="badge badge-small">Activos</span>}
        </h3>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="filter-body">
          <div className="form-group">
            <label>Carátula</label>
            <select
              name="caratula"
              value={local.caratula || ''}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              <option value="rescate">{CARATULA_LABELS.rescate}</option>
              <option value="fallecimiento_ahogamiento">
                {CARATULA_LABELS.fallecimiento_ahogamiento}
              </option>
              <option value="hallazgo_cuerpo_nn">
                {CARATULA_LABELS.hallazgo_cuerpo_nn}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Unidad Regional</label>
            <select
              name="unidad_regional"
              value={local.unidad_regional || ''}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              <option value="URN">URN</option>
              <option value="URS">URS</option>
              <option value="URE">URE</option>
              <option value="URO">URO</option>
            </select>
          </div>

          <div className="form-group">
            <label>Jurisdicción</label>
            <input
              type="text"
              name="jurisdiccion"
              value={local.jurisdiccion || ''}
              onChange={handleChange}
              placeholder="Buscar jurisdicción..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Desde</label>
              <input
                type="date"
                name="fecha_desde"
                value={local.fecha_desde || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input
                type="date"
                name="fecha_hasta"
                value={local.fecha_hasta || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-sm btn-outline" onClick={handleClear}>
              Limpiar
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleApply}>
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
