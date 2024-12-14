import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/services/api";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

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

const Index = () => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchTopAssets,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-900">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 dark:bg-gray-900 transition-colors duration-200">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold dark:text-white">Top 100 Cryptocurrencies</h1>
        <div className="flex gap-4 items-center">
          <DarkModeToggle />
          <Link to="/transactions" className="neo-brutalist flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 dark:text-white">
            <FileText className="h-5 w-5" />
            My Transactions
          </Link>
          <Link to="/ai-cryptos" className="neo-brutalist px-4 py-2 bg-white dark:bg-gray-800 dark:text-white">
            View AI Cryptos
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-black dark:border-gray-700">
          <thead>
            <tr className="bg-[#FFE800] dark:bg-gray-800">
              <th className="border-2 border-black dark:border-gray-700 p-4 text-left dark:text-white">Rank</th>
              <th className="border-2 border-black dark:border-gray-700 p-4 text-left dark:text-white">Name</th>
              <th className="border-2 border-black dark:border-gray-700 p-4 text-left dark:text-white">Price</th>
              <th className="border-2 border-black dark:border-gray-700 p-4 text-left dark:text-white">24h Change</th>
              <th className="border-2 border-black dark:border-gray-700 p-4 text-left dark:text-white">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border-2 border-black dark:border-gray-700 p-4 dark:text-white">{asset.rank}</td>
                <td className="border-2 border-black dark:border-gray-700 p-4">
                  <Link
                    to={`/asset/${asset.id}`}
                    className="flex items-center hover:text-[#FF1F8F] dark:text-white"
                  >
                    <span className="mr-2 font-bold">{asset.symbol}</span>
                    {asset.name}
                  </Link>
                </td>
                <td className="border-2 border-black dark:border-gray-700 p-4 dark:text-white">
                  {formatPrice(asset.priceUsd)}
                </td>
                <td
                  className={`border-2 border-black dark:border-gray-700 p-4 ${
                    Number(asset.changePercent24Hr) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {Number(asset.changePercent24Hr).toFixed(2)}%
                </td>
                <td className="border-2 border-black dark:border-gray-700 p-4 dark:text-white">
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

export default Index;