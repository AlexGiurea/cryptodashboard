import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/services/api";
import { Link } from "react-router-dom";

const AI_RELATED_TOKENS = [
  "fetch-ai",           // FET
  "render",            // RNDR
  "singularitynet",    // AGIX
  "ocean-protocol",    // OCEAN
  "oasis",            // ROSE
  "numeraire",         // NMR
  "injective-protocol", // INJ
  "akash-network",     // AKT
  "cortex",           // CTXC
  "bittensor",        // TAO
  "oraichain",        // ORAI
  "vectorspace",      // VXV
  "graphlinq-protocol", // GLQ
  "matrix-ai-network", // MAN
];

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
};

const formatMarketCap = (marketCap: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(marketCap));
};

const AICryptos = () => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchTopAssets,
    refetchInterval: 30000,
  });

  console.log("Fetched assets:", assets?.length);
  console.log("AI assets found:", assets?.filter(asset => AI_RELATED_TOKENS.includes(asset.id)).length);
  console.log("Available asset IDs:", assets?.map(asset => asset.id).join(", "));
  console.log("Matching assets:", assets?.filter(asset => AI_RELATED_TOKENS.includes(asset.id)).map(asset => asset.id));

  const aiAssets = assets?.filter(asset => AI_RELATED_TOKENS.includes(asset.id)) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Top AI Cryptocurrencies</h1>
        <Link to="/" className="neo-brutalist px-4 py-2">
          View All Cryptos
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-black">
          <thead>
            <tr className="bg-[#FFE800]">
              <th className="border-2 border-black p-4 text-left">Rank</th>
              <th className="border-2 border-black p-4 text-left">Name</th>
              <th className="border-2 border-black p-4 text-left">Price</th>
              <th className="border-2 border-black p-4 text-left">24h Change</th>
              <th className="border-2 border-black p-4 text-left">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {aiAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="border-2 border-black p-4">{asset.rank}</td>
                <td className="border-2 border-black p-4">
                  <Link
                    to={`/asset/${asset.id}`}
                    className="flex items-center hover:text-[#FF1F8F]"
                  >
                    <span className="mr-2 font-bold">{asset.symbol}</span>
                    {asset.name}
                  </Link>
                </td>
                <td className="border-2 border-black p-4">
                  {formatPrice(asset.priceUsd)}
                </td>
                <td
                  className={`border-2 border-black p-4 ${
                    Number(asset.changePercent24Hr) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(asset.changePercent24Hr).toFixed(2)}%
                </td>
                <td className="border-2 border-black p-4">
                  {formatMarketCap(asset.marketCapUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AICryptos;