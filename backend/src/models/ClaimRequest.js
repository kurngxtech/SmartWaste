const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  message: {
    type: String,
    trim: true,
    default: '',
  },
  completedAt: {
    type: Date,
  }
}, { timestamps: true });

// Prevent duplicate requests from the same user for the same donation
claimRequestSchema.index({ donationId: 1, requesterId: 1 }, { unique: true });

const ClaimRequest = mongoose.model('ClaimRequest', claimRequestSchema);
module.exports = ClaimRequest;
