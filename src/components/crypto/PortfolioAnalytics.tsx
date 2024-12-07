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

    // Filter out coins with zero or negative balance
    return Object.entries(netTokens)
      .filter(([_, amount]) => amount > 0)
      .map(([name, amount]) => ({
        name,
        value: amount
      }));
  };

  const COLORS = [
    '#FF1F8F', '#8B5CF6', '#F97316', '#0EA5E9', '#10B981',
    '#6366F1', '#D946EF', '#F59E0B', '#14B8A6', '#8B5CF6'
  ];

  const data = calculateNetTokens();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages
  const chartData = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(2)
  }));

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6">Portfolio Analytics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Portfolio Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="neo-brutalist bg-white p-4">
              <h3 className="text-sm font-semibold">Total Allocated</h3>
              <p className="text-xl font-bold">
                ${totalAllocated.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="neo-brutalist bg-white p-4">
              <h3 className="text-sm font-semibold">Current Value</h3>
              <p className="text-xl font-bold">
                ${currentValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="neo-brutalist bg-white p-4">
              <h3 className="text-sm font-semibold">Total Profit/Loss</h3>
              <p className={`text-xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {isProfitable ? '+' : ''}{profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="neo-brutalist bg-white p-6">
            <h2 className="text-xl font-bold mb-4">Portfolio Allocation by Coin</h2>
            <div className="flex justify-center">
              <PieChart width={600} height={400}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};