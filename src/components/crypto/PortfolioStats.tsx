import React from 'react';

interface PortfolioStatsProps {
  totalAllocated: number;
  currentValue: number;
  percentageChange: number;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  totalAllocated,
  currentValue,
  percentageChange
}) => {
  const profit = currentValue - totalAllocated;
  const isProfitable = profit >= 0;

  return (
    <div className="mb-8 neo-brutalist bg-white border-2 border-black p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Total Allocated</h3>
          <p className="text-2xl font-bold">
            ${totalAllocated.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Current Portfolio Value</h3>
          <p className="text-2xl font-bold flex items-center gap-2 transition-colors duration-300">
            <span className="transition-all duration-300">
              ${currentValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <span 
              className={`text-sm transition-all duration-300 ${
                percentageChange >= 0 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              } px-2 py-1 rounded-full`}
            >
              ({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%)
            </span>
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Total Profit/Loss</h3>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {isProfitable ? '+' : ''}${profit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      </div>
    </div>
  );
};