import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchAssetHistory, fetchTopAssets } from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: assets } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchTopAssets,
  });

  const { data: history } = useQuery({
    queryKey: ["assetHistory", id],
    queryFn: () => fetchAssetHistory(id!),
    enabled: !!id,
  });

  const asset = assets?.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Loading...</div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {asset.name} ({asset.symbol})
        </h1>
        <p className="mt-2 text-xl">
          ${Number(asset.priceUsd).toFixed(2)}{" "}
          <span
            className={`ml-2 ${
              Number(asset.changePercent24Hr) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {Number(asset.changePercent24Hr).toFixed(2)}%
          </span>
        </p>
      </div>

      <div className="neo-brutalist mb-8 bg-white p-4">
        <h2 className="mb-4 text-2xl font-bold">Price History</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="time"
                tickFormatter={formatDate}
                stroke="#000000"
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#000000"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #000000",
                }}
                formatter={(value: any) => [
                  `$${Number(value).toFixed(2)}`,
                  "Price",
                ]}
                labelFormatter={(label) => formatDate(label)}
              />
              <Line
                type="monotone"
                dataKey="priceUsd"
                stroke="#FF1F8F"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="neo-brutalist bg-white p-4">
          <h3 className="mb-2 font-bold">Market Cap</h3>
          <p className="text-xl">
            ${Number(asset.marketCapUsd).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="neo-brutalist bg-white p-4">
          <h3 className="mb-2 font-bold">24h Volume</h3>
          <p className="text-xl">
            ${Number(asset.volumeUsd24Hr).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="neo-brutalist bg-white p-4">
          <h3 className="mb-2 font-bold">Supply</h3>
          <p className="text-xl">
            {Number(asset.supply).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;