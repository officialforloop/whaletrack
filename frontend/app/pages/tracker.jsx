// src/pages/tracker.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/tracker/Header";
import IntervalInput from "@/components/tracker/IntervalInput";
import TransactionTable from "@/components/tracker/TransactionTable";
import { socketService } from "@/services/socket";

export default function Tracker() {
  const [interval, setInterval] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('transactions', (data) => {
      setTransactions(data);
      setLoading(false);
    });

    socket.on('error', (errorMessage) => {
      setError(errorMessage);
      setLoading(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleIntervalChange = useCallback((newInterval) => {
    setInterval(newInterval);
    socketService.changeInterval(newInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <h2 className="text-4xl font-bold mb-4 text-center">Transactions</h2>
          <IntervalInput 
            interval={interval} 
            onIntervalChange={handleIntervalChange}
          />
          {error && (
            <div className="text-red-500 mb-4 text-center">Error: {error}</div>
          )}
          <TransactionTable 
            transactions={transactions} 
            isLoading={loading}
          />
        </div>
      </main>
    </div>
  );
}
