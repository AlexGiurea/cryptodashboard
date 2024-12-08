import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from "@/types/crypto";
import { isSpecialToken } from '@/utils/coinIdMappings';

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
  // Calculate net token amounts and current values for each coin
  const calculateNetTokens = () => {
    const netTokens: Record<string, number> = {};
    const currentValues: Record<string, number> = {};

    // First pass: Calculate net token amounts
    transactions.forEach((tx) => {
      const coinName = tx["Coin Name"];
      const tokenAmount = tx["Sum (in token)"] || 0;
      const txType = tx["Result of acquisition"]?.toLowerCase();

      if (!netTokens[coinName]) {
        netTokens[coinName] = 0;
      }

      if (txType === "buy" || txType === "swap buy") {
        netTokens[coinName] += tokenAmount;
      } else if (txType === "sell" || txType === "swap sell") {
        netTokens[coinName] -= Math.abs(tokenAmount);
      }
    });

    // Second pass: Calculate current values using most recent price for each coin
    Object.entries(netTokens).forEach(([coinName, tokenAmount]) => {
      if (tokenAmount <= 0) return; // Skip coins with zero or negative balance

      // Get the most recent transaction for this coin to get the current price
      const recentTx = [...transactions]
        .filter(tx => tx["Coin Name"] === coinName)
        .sort((a, b) => {
          const dateA = new Date(a["Transaction Date"] || 0);
          const dateB = new Date(b["Transaction Date"] || 0);
          return dateB.getTime() - dateA.getTime();
        })[0];

      if (recentTx) {
        let currentPrice;
        
        if (isSpecialToken(coinName)) {
          // For special tokens like GRASS and TAI, use the original transaction price
          currentPrice = parseFloat(recentTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
        } else {
          // For regular tokens, use the current market price
          currentPrice = parseFloat(recentTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
        }
        
        currentValues[coinName] = tokenAmount * currentPrice;
      }
    });

    // Convert to array format for the pie chart
    return Object.entries(currentValues)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / Object.values(currentValues).reduce((sum, val) => sum + val, 0)) * 100).toFixed(2)
      }))
      .sort((a, b) => b.value - a.value);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] text-white border-gray-800">
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
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-full max-w-2xl">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <div className="text-2xl font-bold text-white">
                    ${currentValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="text-sm text-gray-400">Current Value</div>
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
              
              {/* Separate Legend Section */}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};