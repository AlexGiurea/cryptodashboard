import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/crypto";
import { PieChartComponent } from './portfolio/PieChartComponent';
import { PortfolioLegend } from './portfolio/PortfolioLegend';
import { calculatePortfolioDistribution } from '@/utils/portfolioCalculations';

interface PortfolioAnalyticsProps {
  transactions: Transaction[];
  totalAllocated: number;
  currentValue: number;
  percentageChange: number;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  transactions,
  currentValue,
}) => {
  const data = calculatePortfolioDistribution(transactions);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="neo-brutalist bg-white hover:bg-gray-50"
        >
          Portfolio Distribution
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-6 text-white">Portfolio Distribution</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          <div className="bg-[#1E1E1E] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-white">Current Portfolio Value Distribution</h2>
            <div className="flex flex-col items-center gap-8">
              <PieChartComponent data={data} currentValue={currentValue} />
              <PortfolioLegend data={data} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};