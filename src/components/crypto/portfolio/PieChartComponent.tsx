import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { COLORS, getDefaultColor } from '../../../utils/chartColors';

interface PieChartComponentProps {
  data: Array<{
    name: string;
    value: number;
    percentage: string;
  }>;
  currentValue: number;
}

export const PieChartComponent = ({ data, currentValue }: PieChartComponentProps) => {
  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="text-2xl font-bold text-white">
          ${currentValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
        <div className="text-sm text-gray-400">Total Value</div>
      </div>
      <PieChart width={600} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={100}
          outerRadius={150}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS] || getDefaultColor(index)}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1E1E1E',
            border: '1px solid #333',
            borderRadius: '4px',
            color: 'white'
          }}
          formatter={(value: number) => [
            `$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} (${((value / currentValue) * 100).toFixed(2)}%)`,
            'Value'
          ]}
        />
      </PieChart>
    </div>
  );
};