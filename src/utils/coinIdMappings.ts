// Map of special cases where coin names don't directly match CoinCap API IDs
export const coinIdMappings: Record<string, string> = {
  "near": "near-protocol",
  "tai": "tether", // Map TAI to a stablecoin since it's not available in CoinCap
  "sol": "solana", // Add mapping for Solana
  "grass": "tether", // Map GRASS to a stablecoin as fallback
  "render": "tether", // Map RENDER to a stablecoin as fallback
  // Add more mappings here as needed
};

export const getCoinApiId = (coinName: string): string => {
  const normalizedName = coinName.toLowerCase().replace(/\s+/g, '-');
  return coinIdMappings[normalizedName] || normalizedName;
};

// Add helper to identify special tokens that should use fixed prices
export const isSpecialToken = (coinName: string): boolean => {
  return ["tai", "grass", "render"].includes(coinName.toLowerCase());
};

// Get fixed price for special tokens
export const getSpecialTokenPrice = (coinName: string): string => {
  const tokenPrices: Record<string, string> = {
    "tai": "$0.38",
    "grass": "$1.00",
    "render": "$1.00"
  };
  return tokenPrices[coinName.toLowerCase()] || "N/A";
};