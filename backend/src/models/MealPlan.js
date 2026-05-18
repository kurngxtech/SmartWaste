const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  day: String,
  slot: String,
  date: {
    type: String,
    required: true,
  },
  ingredients: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem'
    },
    itemName: String,
    quantity: Number
  }],
  notes: String,
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  completed: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Ensure id virtualization for frontend matching
mealPlanSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
mealPlanSchema.set('toJSON', { virtuals: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
module.exports = MealPlan;
