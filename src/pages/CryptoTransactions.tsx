import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface Transaction {
  id: number;
  coin_name: string;
  crypto_symbol: string;
  result_of_acquisition: string;
  sum_in_token: number;
  sum_in_usd: number;
  price_of_token_at_moment: string;
  transaction_date: string;
  transaction_platform: string;
  coin_status_sector: string;
}

const CryptoTransactions = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["crypto-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crypto_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-brutalist-pink px-6 py-3 text-xl">Loading...</div>
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
            {transactions?.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.coin_name}</TableCell>
                <TableCell>{tx.crypto_symbol}</TableCell>
                <TableCell>{tx.result_of_acquisition}</TableCell>
                <TableCell>{tx.sum_in_token}</TableCell>
                <TableCell>${tx.sum_in_usd}</TableCell>
                <TableCell>{tx.price_of_token_at_moment}</TableCell>
                <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.transaction_platform}</TableCell>
                <TableCell>{tx.coin_status_sector}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default CryptoTransactions;