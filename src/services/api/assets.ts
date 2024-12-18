import { toast } from "sonner";
import { Asset, AssetHistory } from "./types";
import { BASE_URL } from "./constants";
import { fetchWithRetry, isListedOnCoinCap } from "./utils";
import { getCoinApiId } from "@/utils/coinIdMappings";

export const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    console.log("Fetching top assets...");
    const response = await fetchWithRetry(`${BASE_URL}/assets?limit=100`);
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
    const mappedId = getCoinApiId(id);
    console.log(`Fetching history for asset ${id} (mapped to: ${mappedId})...`);
    const response = await fetchWithRetry(
      `${BASE_URL}/assets/${mappedId}/history?interval=h1`
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
  const mappedId = getCoinApiId(id);
  
  try {
    console.log(`Fetching individual asset ${id} (mapped to: ${mappedId})...`);
    
    // Skip API call for unlisted tokens
    if (!isListedOnCoinCap(mappedId)) {
      console.log(`Skipping API call for ${mappedId} as it's not listed on CoinCap`);
      return null;
    }

    const response = await fetchWithRetry(`${BASE_URL}/assets/${mappedId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Asset ${mappedId} not found in CoinCap API`);
        return null;
      }
      console.error(`Failed to fetch asset ${mappedId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Successfully fetched asset ${mappedId}:`, data.data);
    return data.data;
  } catch (error) {
    console.error(`Error fetching asset ${mappedId}:`, error);
    return null;
  }
};