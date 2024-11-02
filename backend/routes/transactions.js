// backend/routes/transactions.js
import express from 'express';
import { fetchTransactions } from '../services/fetchTransactions.js';

const router = express.Router();

router.get('/api/transactions/:interval', async (req, res) => {
  try {
    const interval = parseInt(req.params.interval) || 1;
    const transactions = await fetchTransactions();
    
    res.json({
      data: transactions,
      interval: interval,
      nextUpdate: Date.now() + (interval * 60 * 1000) // Next update timestamp
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
});

export default router;
