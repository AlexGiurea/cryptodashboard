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

export const fetchIndividualAsset = async (id: string): Promise<Asset | null> => {
  try {
    console.log(`Fetching individual asset ${id}...`);
    const response = await fetch(`${BASE_URL}/assets/${id}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch asset ${id}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Successfully fetched asset ${id}:`, data.data);
    return data.data;
  } catch (error) {
    console.error(`Error fetching asset ${id}:`, error);
    return null;
  }
};

export const sendChatMessage = async (message: string, conversationHistory: { role: string; content: string }[] = []) => {
  try {
    const cryptoData = await fetchTopAssets();
    
    const chartMatch = message.toLowerCase().match(/show (?:me )?(?:the )?(?:chart|graph|price) (?:for |of )?(\w+)/);
    let chartData = null;
    
    if (chartMatch) {
      const symbol = chartMatch[1].toUpperCase();
      const asset = cryptoData.find(a => a.symbol.toLowerCase() === symbol.toLowerCase());
      
      if (asset) {
        console.log(`Fetching chart data for ${asset.name} (${asset.symbol})`);
        const history = await fetchAssetHistory(asset.id);
        chartData = {
          data: history,
          type: "line" as const,
          title: `${asset.name} (${asset.symbol}) Price Chart`
        };
      }
    }

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

    console.log("Sending request to OpenAI with conversation history");
    
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that provides detailed information about cryptocurrencies. Here is the current real-time data from our dashboard, sorted by rank:
        ${JSON.stringify(cryptoContext.sort((a, b) => a.rank - b.rank), null, 2)}
        
        You can display price charts for any cryptocurrency when users ask for them. When users request a chart, you should acknowledge that you're showing the chart and provide relevant analysis of the price data.
        
        Please use this real-time data to answer questions comprehensively. When discussing specific cryptocurrencies, always include:
        - Rank in the market
        - Current price
        - 24h price change
        - Market cap
        - 24h trading volume
        - Current supply
        
        Format numbers in a human-readable way and be precise with the data provided. Give detailed explanations and context when answering questions.`
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { 
      message: data.choices[0].message.content,
      chart: chartData
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};