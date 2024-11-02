import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4040';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentInterval = null;
  }

  connect() {
    if (!this.socket) {
      console.log('Attempting to connect to:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        debug: true,
        autoConnect: true
      });
      
      this.setupEventListeners();
    }
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to WebSocket', {
        id: this.socket.id,
        url: SOCKET_URL,
        currentInterval: this.currentInterval
      });

      if (this.currentInterval) {
        this.changeInterval(this.currentInterval);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', {
        message: error.message,
        description: error.description,
        type: error.type,
        url: SOCKET_URL
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('Disconnected from WebSocket:', {
        reason,
        wasConnected: this.socket.connected,
        currentInterval: this.currentInterval
      });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('intervalChanged', (newInterval) => {
      console.log('Interval changed confirmation:', newInterval);
      this.currentInterval = newInterval;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentInterval = null;
    }
  }

  changeInterval(interval) {
    if (this.socket && this.connected) {
      console.log('Changing interval to:', interval);
      this.currentInterval = interval;
      this.socket.emit('changeInterval', interval);
    } else {
      console.warn('Socket not connected, cannot change interval');
    }
  }

  isConnected() {
    return this.connected;
  }

  getCurrentInterval() {
    return this.currentInterval;
  }
}

export const socketService = new SocketService(); 