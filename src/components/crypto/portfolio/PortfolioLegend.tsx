import { COLORS, getDefaultColor } from '../../../utils/chartColors';

interface PortfolioLegendProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export const PortfolioLegend = ({ data }: PortfolioLegendProps) => {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-[#1A1A1A] rounded-lg">
      {data.map((entry, index) => (
        <div 
          key={entry.name}
          className="flex items-center gap-2 p-2 rounded hover:bg-[#252525] transition-colors"
        >
          <div 
            className="w-4 h-4 rounded-sm"
            style={{ 
              backgroundColor: COLORS[entry.name as keyof typeof COLORS] || getDefaultColor(index)
            }}
          />
          <div>
            <div className="font-medium text-white">{entry.name}</div>
            <div className="text-sm text-gray-400">
              ${entry.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};