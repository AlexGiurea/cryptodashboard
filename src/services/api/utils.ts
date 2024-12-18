// Helper function to handle retries with exponential backoff
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit = {}, 
  retries = 3,
  delay = 1000
): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/json',
      }
    });
    
    if (response.status === 429 && retries > 0) { // Rate limit hit
      console.log(`Rate limit hit, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Helper to check if a token is listed on CoinCap
export const isListedOnCoinCap = (coinName: string): boolean => {
  const unlisted = ["tai", "grass", "render", "tars ai"];
  return !unlisted.includes(coinName.toLowerCase());
};