const MealPlan = require('../models/MealPlan');
const FoodItem = require('../models/FoodItem');

// @route   GET /api/mealplans
// @desc    Get all meal plans for user
const getMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.user.id })
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('[MealPlanController.getMealPlans] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching meal plans' });
  }
};

// @route   POST /api/mealplans
// @desc    Create a new meal plan
const createMealPlan = async (req, res) => {
  try {
    const { name, day, slot, date, ingredients, notes, reminderEnabled } = req.body;

    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'name and date are required' });
    }

    const newPlan = new MealPlan({
      userId: req.user.id,
      name,
      day,
      slot,
      date,
      ingredients: ingredients || [],
      notes,
      reminderEnabled
    });

    const savedPlan = await newPlan.save();

    // Decrement food inventory quantities
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        if (ing.itemId && ing.quantity > 0) {
          const updatedItem = await FoodItem.findByIdAndUpdate(
            ing.itemId,
            { $inc: { quantity: -ing.quantity } },
            { returnDocument: 'after' }
          );
          
          // Optionally mark as used if quantity is <= 0
          if (updatedItem && updatedItem.quantity <= 0) {
            updatedItem.status = 'used';
            await updatedItem.save();
          }
        }
      }
    }

    res.status(201).json({ success: true, data: savedPlan });
  } catch (error) {
    console.error('[MealPlanController.createMealPlan] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error creating meal plan' });
  }
};

// @route   PUT /api/mealplans/:id
// @desc    Update a meal plan (e.g. mark completed)
const updateMealPlan = async (req, res) => {
  try {
    let plan = await MealPlan.findOne({ _id: req.params.id, userId: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    plan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    // If marked as completed, we used to update ingredients to 'used' here,
    // but now quantities are deducted on creation, so we might just leave this.
    // If we wanted, we could mark them as 'used' if we hadn't already.
    if (req.body.completed === true && plan.ingredients) {
      await FoodItem.updateMany(
        { _id: { $in: plan.ingredients.map(i => i.itemId) } },
        { $set: { status: 'used' } }
      );
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('[MealPlanController.updateMealPlan] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating meal plan' });
  }
};

// @route   DELETE /api/mealplans/:id
// @desc    Delete a meal plan
const deleteMealPlan = async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    res.status(200).json({ success: true, message: 'Meal plan removed' });
  } catch (error) {
    console.error('[MealPlanController.deleteMealPlan] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting meal plan' });
  }
};

module.exports = {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan
};
