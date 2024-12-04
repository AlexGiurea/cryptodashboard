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
      let currentValue = 0;
      const processedCoins = new Set<string>();

      // Process each transaction
      for (const tx of transactions) {
        const coinName = tx["Coin Name"];
        const txType = tx["Result of acquisition"]?.toLowerCase();
        const tokenAmount = tx["Sum (in token)"] || 0;

        // Skip if we've already processed this coin
        if (processedCoins.has(coinName)) continue;
        processedCoins.add(coinName);

        try {
          const coinApiId = getCoinApiId(coinName);
          console.log(`Fetching price for ${coinName} using API ID: ${coinApiId}`);
          
          const asset = await fetchIndividualAsset(coinApiId);
          if (asset) {
            // If coin is available in API, calculate using current price and net balance
            const currentPrice = parseFloat(asset.priceUsd);
            
            // Calculate net balance for this coin
            const netBalance = transactions
              .filter(t => t["Coin Name"] === coinName)
              .reduce((balance, t) => {
                const amount = t["Sum (in token)"] || 0;
                const type = t["Result of acquisition"]?.toLowerCase();
                if (type === "buy" || type === "swap buy") {
                  return balance + amount;
                } else if (type === "sell" || type === "swap sell") {
                  return balance - amount;
                }
                return balance;
              }, 0);

            currentValue += currentPrice * netBalance;
          } else {
            // For coins not in API (like TAI), use original transaction prices
            console.log(`Asset ${coinName} not found in CoinCap API, using original transaction prices`);
            
            // Sum up the value using original transaction prices
            const coinValue = transactions
              .filter(t => t["Coin Name"] === coinName)
              .reduce((sum, t) => {
                const type = t["Result of acquisition"]?.toLowerCase();
                const amount = t["Sum (in token)"] || 0;
                const price = parseFloat(t["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
                
                if (type === "buy" || type === "swap buy") {
                  return sum + (amount * price);
                } else if (type === "sell" || type === "swap sell") {
                  return sum - (amount * price);
                }
                return sum;
              }, 0);

            currentValue += coinValue;
          }
        } catch (error) {
          console.error(`Error fetching price for ${coinName}:`, error);
          // Use original transaction prices as fallback
          const coinValue = transactions
            .filter(t => t["Coin Name"] === coinName)
            .reduce((sum, t) => {
              const type = t["Result of acquisition"]?.toLowerCase();
              const amount = t["Sum (in token)"] || 0;
              const price = parseFloat(t["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
              
              if (type === "buy" || type === "swap buy") {
                return sum + (amount * price);
              } else if (type === "sell" || type === "swap sell") {
                return sum - (amount * price);
              }
              return sum;
            }, 0);

          currentValue += coinValue;
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