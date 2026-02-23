import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Stats } from '../../types';
import { UNIDAD_REGIONAL_LABELS } from '../../types';

interface Props {
  stats: Stats;
}

const COLORS: Record<string, string> = {
  URN: '#1b5e20',
  URS: '#e65100',
  URE: '#0d47a1',
  URO: '#4a148c',
  URC: '#b71c1c',
};

export default function ChartByRegional({ stats }: Props) {
  const data = stats.por_unidad_regional.map(item => ({
    name: item.unidad_regional,
    label:
      UNIDAD_REGIONAL_LABELS[
        item.unidad_regional as keyof typeof UNIDAD_REGIONAL_LABELS
      ] || item.unidad_regional,
    cantidad: parseInt(item.cantidad),
  }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Por Unidad Regional</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ left: 0, right: 16, top: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={v => [v, 'Cantidad']}
            labelFormatter={label =>
              UNIDAD_REGIONAL_LABELS[
                label as keyof typeof UNIDAD_REGIONAL_LABELS
              ] || label
            }
          />
          <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#546e7a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
