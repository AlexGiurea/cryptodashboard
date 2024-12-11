import { Transaction } from "@/types/crypto";

export const calculatePortfolioDistribution = (transactions: Transaction[]) => {
  const netTokens: Record<string, number> = {};
  const currentValues: Record<string, number> = {};

  // First pass: Calculate net token amounts for each coin
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

  console.log("Net token amounts:", netTokens);

  // Second pass: Calculate current USD values
  Object.entries(netTokens).forEach(([coinName, tokenAmount]) => {
    // Only process if we have a positive token amount
    if (tokenAmount <= 0) {
      console.log(`Skipping ${coinName} as token amount is ${tokenAmount}`);
      return;
    }

    const upperCaseName = coinName.toUpperCase();
    let currentPrice;

    // Handle special tokens with fixed prices
    if (upperCaseName === "GRASS") {
      currentPrice = 2.88;
      console.log(`Using fixed price for GRASS: $${currentPrice}`);
    } else if (upperCaseName === "RENDER") {
      currentPrice = 8.51;
      console.log(`Using fixed price for RENDER: $${currentPrice}`);
    } else if (upperCaseName === "TAI") {
      currentPrice = 0.38;
      console.log(`Using fixed price for TAI: $${currentPrice}`);
    } else {
      // For regular tokens, use the most recent transaction price
      const recentTx = [...transactions]
        .filter(tx => tx["Coin Name"] === coinName)
        .sort((a, b) => {
          const dateA = new Date(a["Transaction Date"] || 0);
          const dateB = new Date(b["Transaction Date"] || 0);
          return dateB.getTime() - dateA.getTime();
        })[0];

      if (recentTx) {
        currentPrice = parseFloat(recentTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
        console.log(`Using most recent transaction price for ${coinName}: $${currentPrice}`);
      } else {
        console.log(`No recent transaction found for ${coinName}, skipping`);
        return;
      }
    }

    // Calculate total USD value for this coin
    const value = tokenAmount * currentPrice;
    if (value > 0) {
      currentValues[coinName] = value;
      console.log(`${coinName} current holdings: ${tokenAmount} tokens @ $${currentPrice} = $${value.toFixed(2)}`);
    } else {
      console.log(`Skipping ${coinName} as calculated value is ${value}`);
    }
  });

  // Calculate total portfolio value for percentage calculations
  const totalValue = Object.values(currentValues).reduce((sum, val) => sum + val, 0);
  console.log("Total portfolio value:", totalValue);

  // Convert to array format for pie chart, including all coins with value
  return Object.entries(currentValues)
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(2)
    }))
    .sort((a, b) => b.value - a.value);
};