const MealPlan = require('../models/MealPlan');
const FoodItem = require('../models/FoodItem');

// @route   GET /api/mealplans
// @desc    Get all meal plans for user
const getMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.user.id })
      .populate('ingredients')
      .sort({ plannedDate: 1 });
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
    const { title, plannedDate, ingredients } = req.body;

    if (!title || !plannedDate) {
      return res.status(400).json({ success: false, message: 'Title and plannedDate are required' });
    }

    const newPlan = new MealPlan({
      userId: req.user.id,
      title,
      plannedDate,
      ingredients: ingredients || []
    });

    const savedPlan = await newPlan.save();
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
      { new: true }
    );

    // If marked as completed, update ingredients to 'used'
    if (req.body.completed === true) {
      await FoodItem.updateMany(
        { _id: { $in: plan.ingredients } },
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
