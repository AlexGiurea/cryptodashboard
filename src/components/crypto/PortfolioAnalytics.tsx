import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Transaction } from "@/types/crypto";

interface PortfolioAnalyticsProps {
  transactions: Transaction[];
  totalAllocated: number;
  currentValue: number;
  percentageChange: number;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  transactions,
  totalAllocated,
  currentValue,
  percentageChange
}) => {
  // Calculate net token amounts for each coin
  const calculateNetTokens = () => {
    const netTokens: Record<string, number> = {};
    const usdValues: Record<string, number> = {};

    transactions.forEach((tx) => {
      const coinName = tx["Coin Name"];
      const tokenAmount = tx["Sum (in token)"] || 0;
      const usdAmount = tx["Sum (in USD)"] || 0;
      const txType = tx["Result of acquisition"]?.toLowerCase();

      if (!netTokens[coinName]) {
        netTokens[coinName] = 0;
        usdValues[coinName] = 0;
      }

      if (txType === "buy" || txType === "swap buy") {
        netTokens[coinName] += tokenAmount;
        usdValues[coinName] += usdAmount;
      } else if (txType === "sell" || txType === "swap sell") {
        netTokens[coinName] -= Math.abs(tokenAmount);
        usdValues[coinName] -= Math.abs(usdAmount);
      }
    });

    // Filter out coins with zero or negative balance and calculate percentages
    const totalUSDValue = Object.values(usdValues).reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
    
    return Object.entries(usdValues)
      .filter(([_, amount]) => amount > 0)
      .map(([name, amount]) => ({
        name,
        value: amount,
        percentage: ((amount / totalUSDValue) * 100).toFixed(2)
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const COLORS = {
    'ETH': '#3C92FA',
    'BTC': '#F7931A',
    'NEAR': '#00C1DE',
    'DOT': '#E6007A',
    'ADA': '#FF8B1E',
    'LINK': '#2A5ADA',
    'RENDER': '#00A3FF',
    'SOL': '#14F195',
    'GRASS': '#4CAF50',
    'TAI': '#FFD700'
  };

  const getDefaultColor = (index: number) => {
    const defaultColors = [
      '#FF1F8F', '#8B5CF6', '#F97316', '#0EA5E9', '#10B981',
      '#6366F1', '#D946EF', '#F59E0B', '#14B8A6', '#8B5CF6'
    ];
    return defaultColors[index % defaultColors.length];
  };

  const data = calculateNetTokens();
  const profit = currentValue - totalAllocated;
  const isProfitable = profit >= 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="neo-brutalist bg-white hover:bg-gray-50"
        >
          More Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-[#121212] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6 text-white">Portfolio Analytics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Portfolio Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400">Total Allocated</h3>
              <p className="text-xl font-bold text-white">
                ${totalAllocated.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400">Current Value</h3>
              <p className="text-xl font-bold text-white">
                ${currentValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-lg border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400">Total Profit/Loss</h3>
              <p className={`text-xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}{profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-[#1E1E1E] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-white">Portfolio Allocation</h2>
            <div className="flex justify-center items-center relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold text-white">
                  ${(totalAllocated / 1000).toFixed(5)}K
                </div>
                <div className="text-sm text-gray-400">Total Sum (in USD)</div>
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
                    `$${value.toFixed(2)} (${((value / totalAllocated) * 100).toFixed(2)}%)`,
                    'Value'
                  ]}
                />
                <Legend 
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  formatter={(value: string) => (
                    <span style={{ color: 'white' }}>{value}</span>
                  )}
                />
              </PieChart>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};