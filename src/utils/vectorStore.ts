import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { TensorFlowEmbeddings } from "@langchain/community/embeddings/tensorflow";

let vectorStore: MemoryVectorStore | null = null;

export const initializeVectorStore = async (cryptoData: any[]) => {
  console.log("Initializing vector store with crypto data...");
  
  try {
    // Create documents from crypto data
    const documents = cryptoData.map(crypto => {
      const content = `${crypto.name} (${crypto.symbol}) is ranked #${crypto.rank} with a price of $${Number(crypto.priceUsd).toFixed(2)} ` +
        `and a market cap of $${Number(crypto.marketCapUsd).toLocaleString()}. ` +
        `24h change: ${Number(crypto.changePercent24Hr).toFixed(2)}%`;
      
      return new Document({
        pageContent: content,
        metadata: {
          symbol: crypto.symbol,
          name: crypto.name,
          rank: crypto.rank
        }
      });
    });

    // Initialize embeddings
    const embeddings = new TensorFlowEmbeddings();
    
    // Create vector store
    vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    
    console.log("Successfully initialized vector store with crypto data");
    return true;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    return false;
  }
};

export const queryVectorStore = async (query: string, limit: number = 3) => {
  if (!vectorStore) {
    console.error("Vector store not initialized");
    return null;
  }

  try {
    console.log("Querying vector store with:", query);
    const results = await vectorStore.similaritySearch(query, limit);
    
    console.log("Vector store query results:", results);
    return results;
  } catch (error) {
    console.error("Error querying vector store:", error);
    return null;
  }
};