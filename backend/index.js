// backend/index.js
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { transactionMonitor } from './services/cronService.js';
import transactionRoutes from './routes/transactions.js';

const app = express();
const httpServer = createServer(app);

// Environment variables with fallbacks
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const DEFAULT_MONITOR_INTERVAL = parseInt(process.env.DEFAULT_MONITOR_INTERVAL || '1');

// Create Socket.IO instance BEFORE adding routes
const io = new Server(httpServer, {
  path: '/socket.io/',  // Explicitly set the Socket.IO path
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  transports: ['websocket', 'polling']  // Explicitly specify transports
});

// Add debug middleware for Socket.IO
io.engine.on("connection_error", (err) => {
  console.log("Socket.IO connection error:", {
    type: err.type,
    message: err.message,
    context: err.context
  });
});

// Add debug middleware for Express
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Add a health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api', transactionRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected from ${socket.handshake.address}`);

  // Send initial data when client connects
  const initialData = transactionMonitor.getLatestTransactions();
  socket.emit('initial', initialData);

  // Handle interval changes
  socket.on('changeInterval', (interval) => {
    console.log('Received interval change request:', interval);
    
    try {
      const newInterval = parseInt(interval);
      if (isNaN(newInterval) || newInterval < 1) {
        throw new Error('Invalid interval value');
      }

      // Stop existing monitoring
      transactionMonitor.stopMonitoring(DEFAULT_MONITOR_INTERVAL);
      
      // Start new monitoring interval
      transactionMonitor.startMonitoring(newInterval);
      
      // Confirm the change to the client
      socket.emit('intervalChanged', newInterval);
      
      console.log(`Monitoring interval changed to ${newInterval} minutes`);
    } catch (error) {
      console.error('Error changing interval:', error);
      socket.emit('error', { message: 'Failed to change interval' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected from ${socket.handshake.address}`);
  });

  // Error handling for socket
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Listen for transaction updates
transactionMonitor.on('update', (transactions) => {
  io.emit('transactions', transactions);
});

transactionMonitor.on('error', (error) => {
  io.emit('error', error.message);
});

// Start initial monitoring
transactionMonitor.startMonitoring(DEFAULT_MONITOR_INTERVAL);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Socket.IO path: ${io.path()}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
