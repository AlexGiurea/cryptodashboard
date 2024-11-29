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
    const response = await fetch(`${BASE_URL}/assets?limit=50`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    toast.error("Failed to fetch crypto assets");
    return [];
  }
};

export const fetchAssetHistory = async (id: string): Promise<AssetHistory[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/assets/${id}/history?interval=h1`
    );
    const data = await response.json();
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
    
    // Create a condensed version of the data for the context
    const cryptoContext = cryptoData.map(asset => ({
      name: asset.name,
      symbol: asset.symbol,
      price: Number(asset.priceUsd).toFixed(2),
      change24h: Number(asset.changePercent24Hr).toFixed(2)
    }));

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
            content: `You are a helpful assistant that provides information about cryptocurrencies. Here is the current data from our dashboard (prices in USD):
            ${JSON.stringify(cryptoContext, null, 2)}
            
            Please use this real-time data to answer questions. Always mention the current price and 24h change when discussing specific cryptocurrencies.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 150
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