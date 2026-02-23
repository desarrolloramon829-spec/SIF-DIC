import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Stats } from '../../types';

interface Props {
  stats: Stats;
}

export default function ChartByJurisdiccion({ stats }: Props) {
  const data = stats.por_jurisdiccion.map(item => ({
    name: item.jurisdiccion,
    cantidad: parseInt(item.cantidad),
  }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper chart-wrapper--wide">
      <h3 className="chart-title">Top 10 Jurisdicciones con más hechos</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={210}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={v => [v, 'Cantidad']} />
          <Bar dataKey="cantidad" fill="#1565c0" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
