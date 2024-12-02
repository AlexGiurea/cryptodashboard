import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Transaction {
  "Coin Name": string;
  "Crypto symbol": string;
  "Result of acquisition": string;
  "Sum (in token)": number;
  "Sum (in USD)": number;
  "Price of token at the moment": string;
  "Transaction Date": string;
  "Transaction platform": string;
  "Coin status/sector": string;
}

const CryptoTransactions = () => {
  const navigate = useNavigate();
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["crypto-ledger"],
    queryFn: async () => {
      console.log("Fetching transactions from Crypto_Ledger...");
      const { data, error } = await supabase
        .from("Crypto_Ledger")
        .select("*")
        .order("Transaction Date", { ascending: false });

      // Log the raw response for debugging
      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Error fetching from Crypto_Ledger:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No data returned from Crypto_Ledger table. Please check:");
        console.log("1. Table name is correct (case-sensitive)");
        console.log("2. RLS policies are not blocking access");
        console.log("3. Data exists in the table");
      }
      
      console.log("Successfully fetched transactions:", data);
      return data as Transaction[];
    },
  });

  const handleCoinClick = (coinName: string) => {
    // Convert coin name to lowercase and replace spaces with hyphens for URL
    const coinId = coinName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/asset/${coinId}`);
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
      <div className="neo-brutalist bg-white border-2 border-black">
        <ScrollArea className="h-[800px]">
          <Table>
            <TableHeader className="bg-[#FFE800] sticky top-0">
              <TableRow className="hover:bg-[#FFE800]/90">
                <TableHead className="border-2 border-black font-bold">Coin</TableHead>
                <TableHead className="border-2 border-black font-bold">Symbol</TableHead>
                <TableHead className="border-2 border-black font-bold">Type</TableHead>
                <TableHead className="border-2 border-black font-bold">Token Amount</TableHead>
                <TableHead className="border-2 border-black font-bold">USD Amount</TableHead>
                <TableHead className="border-2 border-black font-bold">Token Price</TableHead>
                <TableHead className="border-2 border-black font-bold">Date</TableHead>
                <TableHead className="border-2 border-black font-bold">Platform</TableHead>
                <TableHead className="border-2 border-black font-bold">Sector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-2 border-black">
              {transactions?.map((tx, index) => {
                console.log("Rendering transaction:", tx);
                return (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50 border-b-2 border-black last:border-b-0"
                  >
                    <TableCell 
                      className="border-x-2 border-black font-bold cursor-pointer hover:text-[#FF1F8F] transition-colors"
                      onClick={() => handleCoinClick(tx["Coin Name"])}
                    >
                      {tx["Coin Name"]}
                    </TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Crypto symbol"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Result of acquisition"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Sum (in token)"]}</TableCell>
                    <TableCell className="border-x-2 border-black">${tx["Sum (in USD)"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Price of token at the moment"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Transaction Date"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Transaction platform"]}</TableCell>
                    <TableCell className="border-x-2 border-black">{tx["Coin status/sector"]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CryptoTransactions;