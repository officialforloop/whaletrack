// src/components/tracker/IntervalInput.jsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socketService } from '@/services/socket';

export default function IntervalInput({ 
  interval = 1, 
  onIntervalChange,
  onRefresh 
}) {
  const [inputValue, setInputValue] = useState(String(interval));
  const [countdown, setCountdown] = useState(interval * 60);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const resetCountdown = useCallback(() => {
    setCountdown(interval * 60);
  }, [interval]);

  useEffect(() => {
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsCountdownActive(false);
            onRefresh?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCountdownActive, countdown, interval, onRefresh]);

  useEffect(() => {
    setInputValue(String(interval));
    resetCountdown();
  }, [interval, resetCountdown]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const newInterval = Math.max(1, Math.floor(Number(inputValue) || 1));
      
      if (!socketService.isConnected()) {
        socketService.connect();
      }
      
      socketService.changeInterval(newInterval);
      
      setCountdown(newInterval * 60);
      setIsCountdownActive(true);
    } catch (error) {
      console.error('Error updating interval:', error);
    }
  }, [inputValue]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleManualRefresh = useCallback(async () => {
    try {
      await onRefresh?.();
      setCountdown(interval * 60);
      setIsCountdownActive(true);
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  }, [interval, onRefresh]);

  const formatCountdown = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="mb-8 w-full max-w-md mx-auto backdrop-blur-sm bg-gray-800/30 p-6 rounded-xl shadow-2xl border border-gray-700/50">
      <p className="text-sm mb-6 text-center text-gray-300 font-medium">
        Set Auto-Refresh Interval
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              type="number"
              min="1"
              value={inputValue}
              onChange={handleInputChange}
              className="bg-gray-900/50 border-gray-600 text-white w-full pl-4 pr-12 h-12 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Minutes"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              min
            </span>
          </div>
          <Button 
            type="submit" 
            className="bg-cyan-500 hover:bg-cyan-600 h-12 px-6 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
            disabled={!inputValue || Number(inputValue) < 1}
          >
            Apply
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="bg-gray-900/50 px-6 py-3 rounded-lg border border-gray-700/50 shadow-inner">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full bg-cyan-500 ${isCountdownActive ? 'animate-pulse' : ''}`}></div>
              <span className="text-cyan-400 font-mono text-xl tracking-wider">
                {formatCountdown(countdown)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400 font-medium">
              {isCountdownActive ? (
                `Refreshing every ${interval} minute${interval !== 1 ? 's' : ''}`
              ) : countdown === 0 ? (
                'Click refresh to start countdown'
              ) : (
                'Set interval to start countdown'
              )}
            </p>
            {countdown === 0 && (
              <Button
                type="button"
                onClick={handleManualRefresh}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm px-3 py-1 rounded"
              >
                Refresh Now
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
