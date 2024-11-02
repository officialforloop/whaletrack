// src/components/TransactionTable.jsx
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function TransactionTable({ transactions, isLoading }) {
  const [displayCount, setDisplayCount] = useState(10);
  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [hasNewData, setHasNewData] = useState(false);

  // When new transactions come in, don't update immediately
  useEffect(() => {
    if (JSON.stringify(transactions) !== JSON.stringify(localTransactions)) {
      setHasNewData(true);
    }
  }, [transactions]);

  const handleRefresh = () => {
    setLocalTransactions(transactions);
    setHasNewData(false);
  };

  const showMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const displayedTransactions = localTransactions.slice(0, displayCount);

  return (
    <div className="space-y-4">
      {hasNewData && (
        <div className="flex justify-center">
          <Button
            onClick={handleRefresh}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
          >
            New Transactions Available - Click to Refresh
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-xl">
        <Table className="min-w-full bg-gray-900/50 backdrop-blur-sm text-gray-300">
          <TableHeader>
            <TableRow className="bg-gray-800/50">
              <TableHead className="text-cyan-400 font-semibold px-6 py-4">Transaction Hash</TableHead>
              <TableHead className="text-cyan-400 font-semibold px-6 py-4">Amount (BSC)</TableHead>
              <TableHead className="text-cyan-400 font-semibold px-6 py-4">Sender Address</TableHead>
              <TableHead className="text-cyan-400 font-semibold px-6 py-4">Recipient Address</TableHead>
              <TableHead className="text-cyan-400 font-semibold px-6 py-4">Block Height</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    </svg>
                    <span>Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>No transactions found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedTransactions.map((tx, index) => (
                <TableRow 
                  key={`${tx.hash || 'no-hash'}-${index}`} 
                  className="border-t border-gray-800 transition-colors hover:bg-gray-800/50"
                >
                  <TableCell className="font-mono truncate max-w-[200px] px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span className="text-cyan-400/90">{tx.hash || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-gray-800 text-cyan-400">{tx.amount || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="font-mono truncate max-w-[200px] px-6 py-4 text-gray-400">
                    {tx.sender || 'Unknown'}
                  </TableCell>
                  <TableCell className="font-mono truncate max-w-[200px] px-6 py-4 text-gray-400">
                    {tx.to || 'Unknown'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-gray-800/50 text-gray-300">
                      #{tx.blockHeight || 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {localTransactions.length > displayCount && (
        <div className="flex justify-center">
          <Button
            onClick={showMore}
            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}
