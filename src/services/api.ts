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

    // Create a simplified context with current market data
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
      })
    }));

    console.log("Sending request to OpenAI with market data context");
    
    const messages = [
      {
        role: "system",
        content: `You are a helpful cryptocurrency assistant. Here is the current market data for the top cryptocurrencies:
        ${JSON.stringify(cryptoContext.slice(0, 20), null, 2)}
        
        When asked about specific cryptocurrencies, provide information from this data.
        Format numbers clearly and include rank, price, 24h change, and market cap when available.
        If asked to show a chart, one will be displayed automatically - acknowledge this in your response.`
      },
      ...conversationHistory.slice(-5), // Only keep last 5 messages to prevent token limit
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
    console.log("Received response from OpenAI:", data.choices[0].message.content);
    
    return { 
      message: data.choices[0].message.content,
      chart: chartData
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
