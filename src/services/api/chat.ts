import { supabase } from "@/integrations/supabase/client";
import { fetchTopAssets, fetchAssetHistory } from "./assets";

export const sendChatMessage = async (message: string, conversationHistory: { role: string; content: string }[] = []) => {
  try {
    // Fetch transaction data from Supabase
    console.log("Fetching transaction data from Supabase...");
    const { data: transactionData, error: dbError } = await supabase
      .from("Crypto_Ledger")
      .select("*");

    if (dbError) {
      console.error("Error fetching transaction data:", dbError);
      throw dbError;
    }

    console.log("Successfully fetched transaction data:", transactionData);

    // Get current market data
    const cryptoData = await fetchTopAssets();
    
    // Calculate comprehensive portfolio statistics
    const portfolioAnalysis = transactionData.reduce((analysis: any, tx: any) => {
      const coinName = tx["Coin Name"];
      const type = tx["Result of acquisition"]?.toLowerCase();
      const tokenAmount = tx["Sum (in token)"] || 0;
      const usdAmount = tx["Sum (in USD)"] || 0;

      // Initialize coin data if not exists
      if (!analysis.coins[coinName]) {
        analysis.coins[coinName] = {
          totalTokens: 0,
          totalInvested: 0,
          averageEntryPrice: 0,
          transactions: []
        };
      }

      // Update coin statistics
      if (type === "buy" || type === "swap buy") {
        analysis.coins[coinName].totalTokens += tokenAmount;
        analysis.coins[coinName].totalInvested += usdAmount;
        analysis.totalAllocated += usdAmount;
      } else if (type === "sell" || type === "swap sell") {
        analysis.coins[coinName].totalTokens -= tokenAmount;
        analysis.totalSold += usdAmount;
      }

      // Store transaction
      analysis.coins[coinName].transactions.push(tx);

      // Calculate average entry price
      if (analysis.coins[coinName].totalTokens > 0) {
        analysis.coins[coinName].averageEntryPrice = 
          analysis.coins[coinName].totalInvested / analysis.coins[coinName].totalTokens;
      }

      return analysis;
    }, { 
      coins: {}, 
      totalAllocated: 0, 
      totalSold: 0,
      currentValue: 0
    });

    // Calculate current portfolio value using real-time prices
    for (const [coinName, coinData] of Object.entries(portfolioAnalysis.coins)) {
      const currentAsset = cryptoData.find(
        asset => asset.name.toLowerCase() === coinName.toLowerCase() ||
                asset.symbol.toLowerCase() === coinName.toLowerCase()
      );

      if (currentAsset) {
        const currentPrice = parseFloat(currentAsset.priceUsd);
        const value = currentPrice * (coinData as any).totalTokens;
        (coinData as any).currentPrice = currentPrice;
        (coinData as any).currentValue = value;
        portfolioAnalysis.currentValue += value;
      } else {
        console.log(`Price not found for ${coinName}, using last known price`);
        // Use the last known transaction price for coins not in CoinCap API
        const lastTx = (coinData as any).transactions.slice(-1)[0];
        const lastPrice = parseFloat(lastTx["Price of token at the moment"]?.replace(/[^0-9.]/g, '') || '0');
        const value = lastPrice * (coinData as any).totalTokens;
        (coinData as any).currentPrice = lastPrice;
        (coinData as any).currentValue = value;
        portfolioAnalysis.currentValue += value;
      }
    }

    // Calculate overall portfolio performance
    const portfolioPerformance = {
      totalAllocated: portfolioAnalysis.totalAllocated,
      totalSold: portfolioAnalysis.totalSold,
      currentValue: portfolioAnalysis.currentValue,
      percentageChange: ((portfolioAnalysis.currentValue - portfolioAnalysis.totalAllocated) / portfolioAnalysis.totalAllocated) * 100
    };

    console.log("Portfolio Analysis:", portfolioAnalysis);
    console.log("Portfolio Performance:", portfolioPerformance);

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

    console.log("Sending request to OpenAI with market data and portfolio analysis");
    
    const messages = [
      {
        role: "system",
        content: `You are a helpful cryptocurrency assistant with access to both market data and detailed portfolio analysis. 

Current market data for top cryptocurrencies:
${JSON.stringify(cryptoContext.slice(0, 20), null, 2)}

Portfolio Performance:
- Total Allocated: $${portfolioPerformance.totalAllocated.toFixed(2)}
- Current Portfolio Value: $${portfolioPerformance.currentValue.toFixed(2)}
- Total Realized (Sold): $${portfolioPerformance.totalSold.toFixed(2)}
- Overall Return: ${portfolioPerformance.percentageChange.toFixed(2)}%

Detailed Portfolio Analysis:
${JSON.stringify(portfolioAnalysis.coins, null, 2)}

Transaction History Summary:
${JSON.stringify(transactionData.slice(0, 5), null, 2)}

When asked about specific cryptocurrencies or portfolio analysis:
1. Provide information from current market data
2. Include relevant transaction history insights
3. Format numbers clearly and include rank, price, 24h change, and market cap when available
4. If asked about portfolio performance, provide detailed analysis including:
   - Current value vs allocated capital
   - Individual coin performance
   - Average entry prices vs current prices
   - Unrealized gains/losses
5. If asked to show a chart, one will be displayed automatically - acknowledge this in your response`
      },
      ...conversationHistory.slice(-5),
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
        model: "gpt-4o-mini",
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
