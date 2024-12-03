import { useEffect, useState } from "react";
import { fetchIndividualAsset } from "@/services/api";
import { getCoinApiId } from "@/utils/coinIdMappings";
import { Transaction } from "@/types/crypto";

interface PortfolioStats {
  totalAllocated: number;
  currentValue: number;
  percentageChange: number;
}

export const usePortfolioStats = (transactions: Transaction[] | undefined) => {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalAllocated: 0,
    currentValue: 0,
    percentageChange: 0
  });

  useEffect(() => {
    const calculatePortfolioStats = async () => {
      if (!transactions) return;

      // Calculate total allocated USD
      const totalAllocated = transactions.reduce((sum, tx) => sum + (tx["Sum (in USD)"] || 0), 0);

      // Calculate current value based on real-time prices
      let currentValue = 0;
      for (const tx of transactions) {
        const coinApiId = getCoinApiId(tx["Coin Name"]);
        console.log(`Fetching price for ${tx["Coin Name"]} using API ID: ${coinApiId}`);
        
        const asset = await fetchIndividualAsset(coinApiId);
        if (asset) {
          const currentPrice = parseFloat(asset.priceUsd);
          const tokenAmount = tx["Sum (in token)"] || 0;
          currentValue += currentPrice * tokenAmount;
        }
      }

      // Calculate percentage change
      const percentageChange = ((currentValue - totalAllocated) / totalAllocated) * 100;

      setPortfolioStats({
        totalAllocated,
        currentValue,
        percentageChange
      });
    };

    calculatePortfolioStats();
    // Set up interval for real-time updates
    const interval = setInterval(calculatePortfolioStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [transactions]);

  return portfolioStats;
};