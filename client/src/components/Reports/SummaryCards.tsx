import type { Stats } from '../../types';
import { CARATULA_LABELS, UNIDAD_REGIONAL_LABELS } from '../../types';

interface SummaryCardsProps {
  stats: Stats;
}

const CARATULA_COLOR: Record<string, string> = {
  rescate: '#1565c0',
  fallecimiento_ahogamiento: '#c62828',
  hallazgo_cuerpo_nn: '#6a1b9a',
};

const REGIONAL_COLOR: Record<string, string> = {
  URN: '#1b5e20',
  URS: '#e65100',
  URE: '#0d47a1',
  URO: '#4a148c',
  URC: '#b71c1c',
};

export default function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      {/* Total general */}
      <div className="summary-card summary-card--total">
        <div className="summary-card__icon">📊</div>
        <div className="summary-card__body">
          <span className="summary-card__value">{stats.total}</span>
          <span className="summary-card__label">Total de Hechos</span>
        </div>
      </div>

      {/* Por carátula */}
      {stats.por_caratula.map(item => (
        <div
          key={item.caratula}
          className="summary-card"
          style={{
            borderLeftColor: CARATULA_COLOR[item.caratula] || '#757575',
          }}
        >
          <div className="summary-card__body">
            <span className="summary-card__value">{item.cantidad}</span>
            <span className="summary-card__label">
              {CARATULA_LABELS[item.caratula as keyof typeof CARATULA_LABELS] ||
                item.caratula}
            </span>
          </div>
        </div>
      ))}

      {/* Por unidad regional */}
      {stats.por_unidad_regional.map(item => (
        <div
          key={item.unidad_regional}
          className="summary-card"
          style={{
            borderLeftColor: REGIONAL_COLOR[item.unidad_regional] || '#546e7a',
          }}
        >
          <div className="summary-card__body">
            <span className="summary-card__value">{item.cantidad}</span>
            <span className="summary-card__label">
              {UNIDAD_REGIONAL_LABELS[
                item.unidad_regional as keyof typeof UNIDAD_REGIONAL_LABELS
              ] || item.unidad_regional}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
