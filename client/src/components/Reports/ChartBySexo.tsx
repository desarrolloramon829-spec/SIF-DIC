import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Stats } from '../../types';

interface Props {
  stats: Stats;
}

const COLORS = ['#1565c0', '#e91e63'];
const SEXO_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
};

export default function ChartBySexo({ stats }: Props) {
  const data = stats.por_sexo.map(item => ({
    name: SEXO_LABELS[item.sexo] || item.sexo,
    value: parseInt(item.cantidad),
    sexo: item.sexo,
  }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Por Sexo</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) =>
              `${((value / total) * 100).toFixed(1)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.sexo} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={v => [`${v} hechos`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
