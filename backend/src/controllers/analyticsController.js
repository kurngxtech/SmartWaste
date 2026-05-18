const FoodItem = require('../models/FoodItem');

// @route   GET /api/analytics/summary
// @desc    Get food waste analytics summary for the logged-in user
const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all items for the user
    const items = await FoodItem.find({ userId });

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
      } else if (item.status === 'donated' || item.status === 'claimed') {
        donatedCount++;
        totalTracked++;
      }
    });

    // Waste Reduction Rate = (Used Items / Total Items) × 100%
    // To make it more positive, we can include donated items as well: ((Used + Donated) / Total Tracked) * 100
    let wasteReductionRate = 0;
    if (totalTracked > 0) {
      wasteReductionRate = ((usedCount + donatedCount) / totalTracked) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        usedItems: usedCount,
        wastedItems: wastedCount,
        donatedItems: donatedCount,
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
