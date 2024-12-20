import React, { useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@/types/crypto";

interface TransactionsTableProps {
  transactions: Transaction[];
  currentPrices: Record<string, string>;
  onCoinClick: (coinName: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  currentPrices,
  onCoinClick
}) => {
  // Keep track of previous prices for comparison
  const previousPrices = useRef<Record<string, string>>(currentPrices);

  useEffect(() => {
    // Update previous prices after a delay to allow for animation
    const timer = setTimeout(() => {
      previousPrices.current = currentPrices;
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentPrices]);

  const getPriceChangeClass = (coinName: string): string => {
    if (coinName.toLowerCase() === "tai" || 
        coinName.toLowerCase() === "grass" || 
        coinName.toLowerCase() === "render") return "";
    
    const current = parseFloat(currentPrices[coinName]?.replace(/[^0-9.-]/g, '') || '0');
    const previous = parseFloat(previousPrices.current[coinName]?.replace(/[^0-9.-]/g, '') || '0');
    
    if (current > previous) {
      return "text-green-600 bg-green-100";
    } else if (current < previous) {
      return "text-red-600 bg-red-100";
    }
    return "";
  };

  const getCurrentPrice = (coinName: string): string => {
    const upperCaseName = coinName.toUpperCase();
    
    // Handle special tokens with fixed prices
    if (upperCaseName === "GRASS") {
      console.log("Using fixed price for GRASS: $2.88");
      return "$2.88";
    }
    if (upperCaseName === "RENDER") {
      console.log("Using fixed price for RENDER: $8.51");
      return "$8.51";
    }
    if (upperCaseName === "TAI") {
      return "$0.38";
    }

    return currentPrices[coinName] || "Loading...";
  };

  return (
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
              <TableHead className="border-2 border-black font-bold">Current Price</TableHead>
              <TableHead className="border-2 border-black font-bold">Date</TableHead>
              <TableHead className="border-2 border-black font-bold">Platform</TableHead>
              <TableHead className="border-2 border-black font-bold">Sector</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-2 border-black">
            {transactions?.map((tx, index) => (
              <TableRow 
                key={index} 
                className="hover:bg-gray-50 border-b-2 border-black last:border-b-0"
              >
                <TableCell 
                  className="border-x-2 border-black font-bold cursor-pointer hover:text-[#FF1F8F] transition-colors"
                  onClick={() => onCoinClick(tx["Coin Name"])}
                >
                  {tx["Coin Name"]}
                </TableCell>
                <TableCell className="border-x-2 border-black">{tx["Crypto symbol"]}</TableCell>
                <TableCell className="border-x-2 border-black">{tx["Result of acquisition"]}</TableCell>
                <TableCell className="border-x-2 border-black">{tx["Sum (in token)"]}</TableCell>
                <TableCell className="border-x-2 border-black">${tx["Sum (in USD)"]}</TableCell>
                <TableCell className="border-x-2 border-black">{tx["Price of token at the moment"]}</TableCell>
                <TableCell 
                  className={`border-x-2 border-black transition-all duration-300 px-4 py-2 rounded ${getPriceChangeClass(tx["Coin Name"])}`}
                >
                  {getCurrentPrice(tx["Coin Name"])}
                </TableCell>
                <TableCell className="border-x-2 border-black">{tx["Transaction Date"]}</TableCell>
                <TableCell className="border-x-2 border-black">{tx["Transaction platform"]}</TableCell>
                <TableCell className="border-x-2 border-black">{tx["Coin status/sector"]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};