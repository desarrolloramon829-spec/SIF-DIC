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
import { CARATULA_LABELS } from '../../types';

interface Props {
  stats: Stats;
}

const COLORS = ['#1565c0', '#c62828', '#6a1b9a'];

export default function ChartByCaratula({ stats }: Props) {
  const data = stats.por_caratula.map(item => ({
    name:
      CARATULA_LABELS[item.caratula as keyof typeof CARATULA_LABELS] ||
      item.caratula,
    cantidad: parseInt(item.cantidad),
    caratula: item.caratula,
  }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Por Carátula</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={190}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={v => [v, 'Cantidad']} />
          <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.caratula} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
