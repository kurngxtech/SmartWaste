const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
  refreshToken: {
    type: String,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorCode: {
    type: String,
  },
  twoFactorCodeExpires: {
    type: Date,
  },
  phone: { type: String, default: '+60 12-345-6789' },
  householdSize: { type: Number, default: 1 },
  avatarUrl: { type: String, default: '' },

  // User Preferences
  expiryAlerts: { type: Boolean, default: true },
  donationUpdates: { type: Boolean, default: true },
  weeklySummary: { type: Boolean, default: false },
  diets: { type: [String], default: ['Vegetarian', 'Halal'] },
  donationVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
  locationPrivacy: { type: String, enum: ['exact', 'neighborhood'], default: 'neighborhood' },
  dataAnalyticsOptIn: { type: Boolean, default: true },
  expiryThreshold: { type: Number, default: 3 },
  alertMealReminders: { type: Boolean, default: false },
  deliveryChannel: { type: String, enum: ['app', 'email', 'both'], default: 'both' },
  storageLocations: { type: [String], default: ['Main Fridge', 'Pantry', 'Freezer'] },
  pickupLocations: { type: [String], default: ['Home', 'Office'] },
  preferredCategories: { type: [String], default: ['Vegetarian'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
