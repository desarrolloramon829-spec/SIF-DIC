import type { Stats } from '../../types';
import { CARATULA_LABELS } from '../../types';

interface StatsPanelProps {
  stats: Stats | null;
  totalVisible: number;
}

export default function StatsPanel({ stats, totalVisible }: StatsPanelProps) {
  if (!stats) return null;

  return (
    <div className="stats-panel">
      <h3>📊 Estadísticas</h3>

      <div className="stats-grid">
        <div className="stat-card stat-total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total de hechos</span>
        </div>

        <div className="stat-card stat-visible">
          <span className="stat-number">{totalVisible}</span>
          <span className="stat-label">Visibles en mapa</span>
        </div>
      </div>

      {/* Por carátula */}
      <div className="stats-section">
        <h4>Por Carátula</h4>
        {stats.por_caratula.map(item => (
          <div key={item.caratula} className="stat-row">
            <span className={`stat-dot dot-${item.caratula}`}></span>
            <span className="stat-row-label">
              {CARATULA_LABELS[item.caratula as keyof typeof CARATULA_LABELS] ||
                item.caratula}
            </span>
            <span className="stat-row-value">{item.cantidad}</span>
          </div>
        ))}
      </div>

      {/* Por unidad regional */}
      <div className="stats-section">
        <h4>Por Unidad Regional</h4>
        {stats.por_unidad_regional.map(item => (
          <div key={item.unidad_regional} className="stat-row">
            <span className="stat-row-label">{item.unidad_regional}</span>
            <span className="stat-row-value">{item.cantidad}</span>
          </div>
        ))}
      </div>

      {/* Por sexo */}
      <div className="stats-section">
        <h4>Por Sexo</h4>
        {stats.por_sexo.map(item => (
          <div key={item.sexo} className="stat-row">
            <span className="stat-row-label">
              {item.sexo === 'masculino' ? 'Masculino' : 'Femenino'}
            </span>
            <span className="stat-row-value">{item.cantidad}</span>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="stats-section">
        <h4>Leyenda del Mapa</h4>
        <div className="legend">
          <div className="legend-item">
            <span
              className="legend-circle"
              style={{ backgroundColor: '#4CAF50' }}
            ></span>
            Rescate
          </div>
          <div className="legend-item">
            <span
              className="legend-circle"
              style={{ backgroundColor: '#F44336' }}
            ></span>
            Fallecimiento
          </div>
          <div className="legend-item">
            <span
              className="legend-circle"
              style={{ backgroundColor: '#FF9800' }}
            ></span>
            Hallazgo N.N.
          </div>
          <div className="legend-item">
            <span
              className="legend-circle"
              style={{
                backgroundColor: '#2196F3',
                border: '2px solid #1565C0',
              }}
            ></span>
            Pto. Ingreso
          </div>
          <div className="legend-item">
            <span
              className="legend-circle"
              style={{
                backgroundColor: '#EF5350',
                border: '2px solid #C62828',
              }}
            ></span>
            Pto. Hallazgo
          </div>
        </div>
      </div>
    </div>
  );
}
