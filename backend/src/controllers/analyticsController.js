const FoodItem = require('../models/FoodItem');
const MealPlan = require('../models/MealPlan');

// @route   GET /api/analytics/summary
// @desc    Get food waste analytics summary for the logged-in user
const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all items for the user
    const items = await FoodItem.find({ userId });

    // Fetch all meal plans to count food saved through meal planning
    const mealPlans = await MealPlan.find({ userId });

    let usedCount = 0;
    let wastedCount = 0;
    let donatedCount = 0;
    let totalTracked = 0; // Items that are in a terminal state (used, wasted, donated)

    items.forEach(item => {
      if (item.status === 'used') {
        usedCount++;
        totalTracked++;
      } else if (item.status === 'wasted' || item.status === 'expired') {
        wastedCount++;
        totalTracked++;
      } else if (item.status === 'donated' || item.status === 'claimed' || item.status === 'completed') {
        donatedCount++;
        totalTracked++;
      }
    });

    // Count total unique food items consumed through meal plans.
    // This captures partial-use scenarios where items stay 'available' status
    // but have been used in meal planning (i.e. food saved from waste).
    const savedItemIds = new Set();
    let totalSavedQuantity = 0;
    mealPlans.forEach(plan => {
      if (plan.ingredients && plan.ingredients.length > 0) {
        plan.ingredients.forEach(ing => {
          if (ing.itemId) {
            savedItemIds.add(ing.itemId.toString());
            totalSavedQuantity += ing.quantity || 0;
          }
        });
      }
    });

    // "Food Saved" = unique items consumed via meal plans OR marked as 'used'
    // Use the larger of: items with 'used' status, or items referenced in meal plans
    const totalFoodSaved = Math.max(usedCount, savedItemIds.size);

    // Waste Reduction Rate = ((Used + Donated) / Total Tracked) * 100
    let wasteReductionRate = 0;
    if (totalTracked > 0) {
      wasteReductionRate = ((usedCount + donatedCount) / totalTracked) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        usedItems: totalFoodSaved,
        wastedItems: wastedCount,
        donatedItems: donatedCount,
        totalSavedQuantity: totalSavedQuantity,
        wasteReductionRate: wasteReductionRate.toFixed(2) + '%'
      }
    });
  } catch (error) {
    console.error('[AnalyticsController.getAnalyticsSummary] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching analytics' });
  }
};

module.exports = {
  getAnalyticsSummary
};
