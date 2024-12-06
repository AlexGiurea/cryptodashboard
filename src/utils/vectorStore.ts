import { ChromaClient, Collection } from 'chromadb';

let collection: Collection | null = null;

export const initializeChromaDB = async (cryptoData: any[]) => {
  console.log("Initializing ChromaDB with crypto data...");
  const client = new ChromaClient();
  
  try {
    // Create or get collection
    collection = await client.createCollection({
      name: "crypto_data",
      metadata: { "description": "Top cryptocurrency data for RAG" }
    });

    // Prepare documents and metadata
    const documents = cryptoData.map(crypto => 
      `${crypto.name} (${crypto.symbol}) is ranked #${crypto.rank} with a price of $${Number(crypto.priceUsd).toFixed(2)} ` +
      `and a market cap of $${Number(crypto.marketCapUsd).toLocaleString()}. ` +
      `24h change: ${Number(crypto.changePercent24Hr).toFixed(2)}%`
    );

    const ids = cryptoData.map((_, index) => `crypto_${index}`);
    const metadatas = cryptoData.map(crypto => ({
      symbol: crypto.symbol,
      name: crypto.name,
      rank: crypto.rank
    }));

    // Add data to collection
    await collection.add({
      ids,
      documents,
      metadatas
    });

    console.log("Successfully initialized ChromaDB with crypto data");
    return true;
  } catch (error) {
    console.error("Error initializing ChromaDB:", error);
    return false;
  }
};

export const queryChromaDB = async (query: string, limit: number = 3) => {
  if (!collection) {
    console.error("ChromaDB collection not initialized");
    return null;
  }

  try {
    console.log("Querying ChromaDB with:", query);
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit
    });

    console.log("ChromaDB query results:", results);
    return results;
  } catch (error) {
    console.error("Error querying ChromaDB:", error);
    return null;
  }
};