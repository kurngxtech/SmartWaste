const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,           
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'available',
      'expiring',
      'expired',
      'used',
      'donating',
      'donated',
      'wasted',
      'claimed'
    ],
    default: 'available',
  },
  notes: {
    type: String,
    trim: true,
  },
  // Donation-specific fields
  donationQuantity: {
    type: Number,
    default: 0,
  },
  pickupDate: {
    type: Date,
  },
  pickupTime: {
    type: String,
    trim: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  pickupLocation: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
module.exports = FoodItem;
