import { useState } from 'react';
import type { FiltrosHechos, CaratulaTipo, UnidadRegional } from '../../types';
import { CARATULA_LABELS, UNIDAD_REGIONAL_LABELS } from '../../types';

interface ReportFilterBarProps {
  filtros: FiltrosHechos;
  onApply: (filtros: FiltrosHechos) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
}

export default function ReportFilterBar({
  filtros,
  onApply,
  onExportCSV,
  onExportPDF,
  isExporting,
}: ReportFilterBarProps) {
  const [local, setLocal] = useState<FiltrosHechos>(filtros);

  const handleChange = (key: keyof FiltrosHechos, value: string) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(local);
  };

  const handleClear = () => {
    const empty: FiltrosHechos = {};
    setLocal(empty);
    onApply(empty);
  };

  const hasFilters = Object.values(local).some(v => v && v !== '');

  return (
    <div className="report-filter-bar">
      <div className="report-filter-bar__filters">
        {/* Carátula */}
        <div className="report-filter-field">
          <label>Carátula</label>
          <select
            value={local.caratula || ''}
            onChange={e =>
              handleChange('caratula', e.target.value as CaratulaTipo | '')
            }
          >
            <option value="">Todas</option>
            {Object.entries(CARATULA_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Unidad Regional */}
        <div className="report-filter-field">
          <label>Unidad Regional</label>
          <select
            value={local.unidad_regional || ''}
            onChange={e =>
              handleChange(
                'unidad_regional',
                e.target.value as UnidadRegional | ''
              )
            }
          >
            <option value="">Todas</option>
            {Object.entries(UNIDAD_REGIONAL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {k} — {v.replace('Unidad Regional ', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Jurisdicción */}
        <div className="report-filter-field">
          <label>Jurisdicción</label>
          <input
            type="text"
            placeholder="Buscar jurisdicción..."
            value={local.jurisdiccion || ''}
            onChange={e => handleChange('jurisdiccion', e.target.value)}
          />
        </div>

        {/* Fecha Desde */}
        <div className="report-filter-field">
          <label>Desde</label>
          <input
            type="date"
            value={local.fecha_desde || ''}
            onChange={e => handleChange('fecha_desde', e.target.value)}
          />
        </div>

        {/* Fecha Hasta */}
        <div className="report-filter-field">
          <label>Hasta</label>
          <input
            type="date"
            value={local.fecha_hasta || ''}
            onChange={e => handleChange('fecha_hasta', e.target.value)}
          />
        </div>
      </div>

      <div className="report-filter-bar__actions">
        {hasFilters && (
          <button className="btn btn-sm btn-outline" onClick={handleClear}>
            Limpiar
          </button>
        )}
        <button className="btn btn-sm btn-primary" onClick={handleApply}>
          Aplicar filtros
        </button>
        <div className="report-filter-bar__divider" />
        <button
          className="btn btn-sm btn-success"
          onClick={onExportCSV}
          disabled={isExporting}
          title="Descargar datos en CSV (compatible con Excel)"
        >
          ⬇ CSV
        </button>
        <button
          className="btn btn-sm btn-warning"
          onClick={onExportPDF}
          disabled={isExporting}
          title="Exportar informe en PDF"
        >
          📄 PDF
        </button>
      </div>
    </div>
  );
}
