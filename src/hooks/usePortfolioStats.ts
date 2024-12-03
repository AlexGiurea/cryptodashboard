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

      // Calculate total allocated USD from only "Buy" transactions
      const totalAllocated = transactions
        .filter(tx => tx["Result of acquisition"]?.toLowerCase() === "buy")
        .reduce((sum, tx) => sum + (tx["Sum (in USD)"] || 0), 0);

      // Calculate current value based on net token amounts and real-time prices
      let tokenBalances: Record<string, number> = {};

      // Calculate net token balances
      transactions.forEach(tx => {
        const tokenAmount = tx["Sum (in token)"] || 0;
        const coinName = tx["Coin Name"];
        const txType = tx["Result of acquisition"]?.toLowerCase();

        if (!tokenBalances[coinName]) {
          tokenBalances[coinName] = 0;
        }

        // Add amounts for buy and swap-buy transactions
        if (txType === "buy" || txType === "swap buy") {
          tokenBalances[coinName] += tokenAmount;
        }
        // Subtract amounts for sell and swap-sell transactions
        else if (txType === "sell" || txType === "swap sell") {
          tokenBalances[coinName] -= tokenAmount;
        }
      });

      // Calculate current value using real-time prices
      let currentValue = 0;
      for (const [coinName, balance] of Object.entries(tokenBalances)) {
        if (balance === 0) continue; // Skip if no net holdings

        try {
          const coinApiId = getCoinApiId(coinName);
          console.log(`Fetching price for ${coinName} using API ID: ${coinApiId}`);
          
          const asset = await fetchIndividualAsset(coinApiId);
          if (asset) {
            const currentPrice = parseFloat(asset.priceUsd);
            currentValue += currentPrice * balance;
          } else {
            // If the asset is not found in CoinCap API, use the latest transaction price
            console.log(`Asset ${coinName} not found in CoinCap API, using latest transaction price`);
            const latestTx = [...transactions]
              .filter(tx => tx["Coin Name"] === coinName)
              .sort((a, b) => {
                const dateA = new Date(a["Transaction Date"] || 0);
                const dateB = new Date(b["Transaction Date"] || 0);
                return dateB.getTime() - dateA.getTime();
              })[0];
            
            if (latestTx) {
              const originalPrice = parseFloat(latestTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
              currentValue += originalPrice * balance;
            }
          }
        } catch (error) {
          console.error(`Error fetching price for ${coinName}:`, error);
          // Use latest transaction price as fallback
          const latestTx = [...transactions]
            .filter(tx => tx["Coin Name"] === coinName)
            .sort((a, b) => {
              const dateA = new Date(a["Transaction Date"] || 0);
              const dateB = new Date(b["Transaction Date"] || 0);
              return dateB.getTime() - dateA.getTime();
            })[0];
          
          if (latestTx) {
            const originalPrice = parseFloat(latestTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
            currentValue += originalPrice * balance;
          }
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