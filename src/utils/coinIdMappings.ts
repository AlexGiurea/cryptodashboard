// Map of special cases where coin names don't directly match CoinCap API IDs
export const coinIdMappings: Record<string, string> = {
  "near": "near-protocol",
  "tai": "tether", // Map TAI to a stablecoin since it's not available in CoinCap
  "sol": "solana", // Add mapping for Solana
  // Add more mappings here as needed
};

export const getCoinApiId = (coinName: string): string => {
  const normalizedName = coinName.toLowerCase().replace(/\s+/g, '-');
  return coinIdMappings[normalizedName] || normalizedName;
};