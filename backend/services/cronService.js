import cron from 'node-cron';
import { fetchTransactions } from './fetchTransactions.js';
import { EventEmitter } from 'events';

class TransactionMonitor extends EventEmitter {
  constructor() {
    super();
    this.latestTransactions = [];
    this.activeJobs = new Map();
    this.initialize();
  }

  async initialize() {
    try {
      const initialTransactions = await fetchTransactions();
      this.latestTransactions = initialTransactions;
      this.emit('initial', initialTransactions);
      console.log(`[${new Date().toISOString()}] Initial transactions fetched`);
    } catch (error) {
      console.error('Initial fetch error:', error);
      this.emit('error', error);
    }
  }

  // Start monitoring with a specific interval (in minutes)
  async startMonitoring(interval = 1) {
    if (this.activeJobs.has(interval)) {
      return;
    }

    try {
      // Fetch transactions immediately before starting the cron job
      const transactions = await fetchTransactions();
      this.latestTransactions = transactions;
      this.emit('update', transactions);
      console.log(`[${new Date().toISOString()}] Initial transactions fetched for interval ${interval}`);

      // Then set up the cron job for subsequent fetches
      const cronExpression = `*/${interval} * * * *`;
      const job = cron.schedule(cronExpression, async () => {
        try {
          const newTransactions = await fetchTransactions();
          this.latestTransactions = newTransactions;
          this.emit('update', newTransactions);
          console.log(`[${new Date().toISOString()}] Transactions updated`);
        } catch (error) {
          console.error('Cron job error:', error);
          this.emit('error', error);
        }
      });

      this.activeJobs.set(interval, job);
      console.log(`Started monitoring with ${interval} minute interval`);
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.emit('error', error);
    }
  }

  // Stop monitoring for a specific interval
  stopMonitoring(interval) {
    const job = this.activeJobs.get(interval);
    if (job) {
      job.stop();
      this.activeJobs.delete(interval);
      console.log(`Stopped monitoring with ${interval} minute interval`);
    }
  }

  // Get latest transactions
  getLatestTransactions() {
    return this.latestTransactions;
  }
}

export const transactionMonitor = new TransactionMonitor();