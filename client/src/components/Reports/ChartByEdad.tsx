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

interface Props {
  stats: Stats;
}

const COLORS_BY_RANGE: Record<string, string> = {
  '0-12': '#81d4fa',
  '13-17': '#29b6f6',
  '18-30': '#0288d1',
  '31-50': '#01579b',
  '51+': '#003c71',
  'Sin dato': '#bdbdbd',
};

const ORDER = ['0-12', '13-17', '18-30', '31-50', '51+', 'Sin dato'];

export default function ChartByEdad({ stats }: Props) {
  const data = [...stats.por_edad]
    .sort((a, b) => ORDER.indexOf(a.rango) - ORDER.indexOf(b.rango))
    .map(item => ({
      rango: item.rango,
      cantidad: parseInt(item.cantidad),
    }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Por Rango Etario</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="rango" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={v => [v, 'Cantidad']}
            labelFormatter={l => `Rango: ${l}`}
          />
          <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.rango}
                fill={COLORS_BY_RANGE[entry.rango] || '#546e7a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
