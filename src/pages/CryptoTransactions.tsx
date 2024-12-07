import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Transaction } from "@/types/crypto";
import { usePortfolioStats } from "@/hooks/usePortfolioStats";
import { getCoinApiId, isSpecialToken, getSpecialTokenPrice } from "@/utils/coinIdMappings";
import { useEffect, useState } from "react";
import { fetchIndividualAsset } from "@/services/api";
import { PortfolioStats } from "@/components/crypto/PortfolioStats";
import { TransactionsTable } from "@/components/crypto/TransactionsTable";
import { PortfolioAnalytics } from "@/components/crypto/PortfolioAnalytics";

const CryptoTransactions = () => {
  const navigate = useNavigate();
  const [currentPrices, setCurrentPrices] = useState<Record<string, string>>({});

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["crypto-ledger"],
    queryFn: async () => {
      console.log("Fetching transactions from Crypto_Ledger...");
      const { data, error } = await supabase
        .from("Crypto_Ledger")
        .select("*")
        .order("Transaction Date", { ascending: true });

      if (error) {
        console.error("Error fetching from Crypto_Ledger:", error);
        throw error;
      }
      
      console.log("Successfully fetched transactions:", data);
      return data as Transaction[];
    },
  });

  const portfolioStats = usePortfolioStats(transactions);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!transactions) return;

      const uniqueCoins = new Set(transactions.map(tx => tx["Coin Name"]));
      const newPrices: Record<string, string> = {};

      for (const coinName of uniqueCoins) {
        // Handle special tokens with fixed prices
        if (isSpecialToken(coinName)) {
          newPrices[coinName] = getSpecialTokenPrice(coinName);
          continue;
        }

        try {
          const coinApiId = getCoinApiId(coinName);
          console.log(`Fetching price for ${coinName} using API ID: ${coinApiId}`);
          const asset = await fetchIndividualAsset(coinApiId);

          if (asset) {
            newPrices[coinName] = `$${parseFloat(asset.priceUsd).toFixed(2)}`;
          } else {
            console.log(`Asset ${coinName} not found in CoinCap API, using original transaction prices`);
            const recentTx = transactions
              .filter(tx => tx["Coin Name"] === coinName)
              .sort((a, b) => {
                const dateA = new Date(a["Transaction Date"] || 0);
                const dateB = new Date(b["Transaction Date"] || 0);
                return dateB.getTime() - dateA.getTime();
              })[0];

            if (recentTx) {
              newPrices[coinName] = recentTx["Price of token at the moment"] || "N/A";
            }
          }
        } catch (error) {
          console.error(`Error fetching price for ${coinName}:`, error);
          const recentTx = transactions
            .filter(tx => tx["Coin Name"] === coinName)
            .sort((a, b) => {
              const dateA = new Date(a["Transaction Date"] || 0);
              const dateB = new Date(b["Transaction Date"] || 0);
              return dateB.getTime() - dateA.getTime();
            })[0];

          if (recentTx) {
            newPrices[coinName] = recentTx["Price of token at the moment"] || "N/A";
          }
        }
      }

      setCurrentPrices(newPrices);
    };

    fetchPrices();
    // Update prices every 10 seconds
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [transactions]);

  const handleCoinClick = (coinName: string) => {
    const coinApiId = getCoinApiId(coinName);
    navigate(`/asset/${coinApiId}`);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Error loading transactions. Please check the console.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Loading...</div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <h1 className="mb-8 text-4xl font-bold">Crypto Transactions Ledger</h1>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-xl text-gray-500">No transactions found in the database.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Crypto Transactions Ledger</h1>
        <Button 
          onClick={() => navigate('/')} 
          className="neo-brutalist flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Top Cryptos
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <PortfolioStats 
            totalAllocated={portfolioStats.totalAllocated}
            currentValue={portfolioStats.currentValue}
            percentageChange={portfolioStats.percentageChange}
          />
          <PortfolioAnalytics 
            transactions={transactions || []}
            totalAllocated={portfolioStats.totalAllocated}
            currentValue={portfolioStats.currentValue}
            percentageChange={portfolioStats.percentageChange}
          />
        </div>
      </div>

      <TransactionsTable 
        transactions={transactions || []}
        currentPrices={currentPrices}
        onCoinClick={handleCoinClick}
      />
    </div>
  );
};

export default CryptoTransactions;
