import { toast } from "sonner";

const BASE_URL = "https://api.coincap.io/v2";

export interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface AssetHistory {
  priceUsd: string;
  time: number;
  date: string;
}

export const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    console.log("Fetching top assets...");
    const response = await fetch(`${BASE_URL}/assets?limit=100`);
    const data = await response.json();
    console.log("Fetched top assets successfully:", data.data.length, "assets");
    return data.data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error("Failed to fetch crypto assets");
    return [];
  }
};

export const fetchAssetHistory = async (id: string): Promise<AssetHistory[]> => {
  try {
    console.log(`Fetching history for asset ${id}...`);
    const response = await fetch(
      `${BASE_URL}/assets/${id}/history?interval=h1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched history successfully for ${id}:`, data.data.length, "data points");
    return data.data;
  } catch (error) {
    console.error("Error fetching asset history:", error);
    toast.error("Failed to fetch asset history");
    return [];
  }
};

export const sendChatMessage = async (message: string) => {
  try {
    // First, fetch the current crypto data
    const cryptoData = await fetchTopAssets();
    
    // Create a detailed version of the data for the context
    const cryptoContext = cryptoData.map(asset => ({
      rank: Number(asset.rank),
      name: asset.name,
      symbol: asset.symbol,
      price: Number(asset.priceUsd).toFixed(2),
      change24h: Number(asset.changePercent24Hr).toFixed(2),
      marketCap: Number(asset.marketCapUsd).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      volume24h: Number(asset.volumeUsd24Hr).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      supply: Number(asset.supply).toLocaleString(undefined, {
        maximumFractionDigits: 0
      })
    }));

    console.log("Sending crypto context to OpenAI:", cryptoContext);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that provides detailed information about cryptocurrencies. Here is the current real-time data from our dashboard, sorted by rank:
            ${JSON.stringify(cryptoContext.sort((a, b) => a.rank - b.rank), null, 2)}
            
            Please use this real-time data to answer questions comprehensively. When discussing specific cryptocurrencies, always include:
            - Rank in the market
            - Current price
            - 24h price change
            - Market cap
            - 24h trading volume
            - Current supply
            
            Format numbers in a human-readable way and be precise with the data provided. Give detailed explanations and context when answering questions.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500  // Increased from 150 to 500 for longer responses
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { message: data.choices[0].message.content };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};