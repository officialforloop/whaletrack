import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  hash: String,
  from: String,
  to: String,
  value: Number,
  timestamp: Date,
});

export default mongoose.model('Transaction', transactionSchema);

