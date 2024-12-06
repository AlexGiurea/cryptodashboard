import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';

let collection: any = null;

// Initialize embedding function using OpenAI
const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: import.meta.env.VITE_OPENAI_API_KEY
});

export const initializeVectorStore = async (cryptoData: any[]) => {
  try {
    console.log("Initializing ChromaDB with crypto data...");
    
    // Initialize ChromaDB client with HTTP
    const client = new ChromaClient({
      path: "http://localhost:8000"
    });
    
    // Create or get collection with proper params
    try {
      collection = await client.getCollection({
        name: "crypto-data",
        embeddingFunction
      });
      console.log("Retrieved existing collection");
    } catch {
      collection = await client.createCollection({
        name: "crypto-data",
        embeddingFunction,
        metadata: { "description": "Cryptocurrency market data" }
      });
      console.log("Created new collection");
    }

    // Prepare documents, metadatas and ids
    const documents = cryptoData.map(crypto => {
      return `${crypto.name} (${crypto.symbol}) is ranked #${crypto.rank} with a price of $${Number(crypto.priceUsd).toFixed(2)} ` +
        `and a market cap of $${Number(crypto.marketCapUsd).toLocaleString()}. ` +
        `24h change: ${Number(crypto.changePercent24Hr).toFixed(2)}%`;
    });

    const metadatas = cryptoData.map(crypto => ({
      symbol: crypto.symbol,
      name: crypto.name,
      rank: crypto.rank
    }));

    const ids = cryptoData.map((_, index) => `crypto-${index}`);

    // Add documents to collection
    await collection.add({
      documents,
      metadatas,
      ids
    });

    console.log("Successfully added documents to ChromaDB");
    return true;
  } catch (error) {
    console.error("Error initializing ChromaDB:", error);
    return false;
  }
};

export const queryVectorStore = async (query: string, limit: number = 3) => {
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
    return results.documents[0].map((doc: string, index: number) => ({
      pageContent: doc,
      metadata: results.metadatas[0][index]
    }));
  } catch (error) {
    console.error("Error querying ChromaDB:", error);
    return null;
  }
};