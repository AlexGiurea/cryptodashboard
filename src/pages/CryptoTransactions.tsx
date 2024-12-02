import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

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
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["crypto-ledger"],
    queryFn: async () => {
      console.log("Fetching transactions from Crypto_Ledger...");
      const { data, error } = await supabase
        .from("Crypto_Ledger")
        .select("*")
        .order("Transaction Date", { ascending: false });

      if (error) {
        console.error("Error fetching from Crypto_Ledger:", error);
        throw error;
      }
      
      console.log("Successfully fetched transactions:", data);
      return data as Transaction[];
    },
  });

  if (error) {
    console.error("Error in useQuery:", error);
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
      <h1 className="mb-8 text-4xl font-bold">Crypto Transactions Ledger</h1>
      <ScrollArea className="h-[800px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coin</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Acquisition Type</TableHead>
              <TableHead>Token Amount</TableHead>
              <TableHead>USD Amount</TableHead>
              <TableHead>Token Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Sector</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((tx, index) => {
              console.log("Rendering transaction:", tx);
              return (
                <TableRow key={index}>
                  <TableCell>{tx["Coin Name"]}</TableCell>
                  <TableCell>{tx["Crypto symbol"]}</TableCell>
                  <TableCell>{tx["Result of acquisition"]}</TableCell>
                  <TableCell>{tx["Sum (in token)"]}</TableCell>
                  <TableCell>${tx["Sum (in USD)"]}</TableCell>
                  <TableCell>{tx["Price of token at the moment"]}</TableCell>
                  <TableCell>{tx["Transaction Date"]}</TableCell>
                  <TableCell>{tx["Transaction platform"]}</TableCell>
                  <TableCell>{tx["Coin status/sector"]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default CryptoTransactions;