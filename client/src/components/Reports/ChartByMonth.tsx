import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';
import type { Stats } from '../../types';

interface Props {
  stats: Stats;
}

const MESES_ES: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
};

const formatMes = (mes: string) => {
  const [year, month] = mes.split('-');
  return `${MESES_ES[month] || month} ${year.slice(2)}`;
};

export default function ChartByMonth({ stats }: Props) {
  const data = stats.por_mes.map(item => ({
    mes: item.mes,
    label: formatMes(item.mes),
    cantidad: parseInt(item.cantidad),
  }));

  if (data.length === 0) {
    return <div className="chart-empty">Sin datos</div>;
  }

  return (
    <div className="chart-wrapper chart-wrapper--wide">
      <h3 className="chart-title">Evolución Mensual de Hechos</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ left: 0, right: 16, top: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-30}
            dy={8}
            height={48}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={v => [v, 'Hechos']}
            labelFormatter={l => `Mes: ${l}`}
          />
          <Line
            type="monotone"
            dataKey="cantidad"
            stroke="#1565c0"
            strokeWidth={2.5}
            dot={<Dot r={4} fill="#1565c0" />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
