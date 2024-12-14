// Map of special cases where coin names don't directly match CoinCap API IDs
export const coinIdMappings: Record<string, string> = {
  "near": "near-protocol",
  "tai": "tether", // Map TAI to a stablecoin since it's not available in CoinCap
  "sol": "solana",
  "grass": "grass", // Keep GRASS separate to handle its price specially
  "render": "render", // Keep RENDER separate to handle its price specially
  "tars ai": "tars-ai", // Add mapping for Tars AI
  "vectorspace": "vxv", // Add correct mapping for Vectorspace
  "fetch-ai": "fetch", // Add correct mapping for Fetch.ai
};

export const getCoinApiId = (coinName: string): string => {
  const normalizedName = coinName.toLowerCase().replace(/\s+/g, '-');
  return coinIdMappings[normalizedName] || normalizedName;
};

// Add helper to identify special tokens that should use fixed prices
export const isSpecialToken = (coinName: string): boolean => {
  return ["tai", "grass", "render", "tars ai"].includes(coinName.toLowerCase());
};

// Get fixed price for special tokens
export const getSpecialTokenPrice = (coinName: string): string => {
  const tokenPrices: Record<string, string> = {
    "tai": "$0.38",
    "grass": "$2.88",
    "render": "$8.51",
    "tars ai": "$0.00" // Add Tars AI with a default price of 0
  };
  return tokenPrices[coinName.toLowerCase()] || "N/A";
};

// Helper to check if a token is listed on CoinCap
export const isListedOnCoinCap = (coinName: string): boolean => {
  const unlisted = ["tai", "grass", "render", "tars ai"];
  return !unlisted.includes(coinName.toLowerCase());
};