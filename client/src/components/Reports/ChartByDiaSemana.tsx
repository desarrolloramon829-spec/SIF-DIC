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

const DIA_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

const DIA_COLORS = [
  '#ef5350',
  '#42a5f5',
  '#42a5f5',
  '#42a5f5',
  '#42a5f5',
  '#42a5f5',
  '#7e57c2',
];

export default function ChartByDiaSemana({ stats }: Props) {
  const raw = stats.por_dia_semana;

  // Completar los 7 días aunque no haya datos
  const data = [0, 1, 2, 3, 4, 5, 6].map(dnum => {
    const found = raw.find(r => r.dia_num === dnum);
    return {
      dia_num: dnum,
      dia: DIA_LABELS[dnum],
      cantidad: found ? parseInt(found.cantidad) : 0,
    };
  });

  const hasData = data.some(d => d.cantidad > 0);
  if (!hasData) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Por Día de la Semana</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={v => [v, 'Hechos']}
            labelFormatter={l => `Día: ${l}`}
          />
          <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.dia_num} fill={DIA_COLORS[entry.dia_num]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
