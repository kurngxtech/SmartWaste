const FoodItem = require('../models/FoodItem');
const Notification = require('../models/Notification'); // For notifying the donor

// @route   GET /api/donations
// @desc    Get all available donations from the community
const getDonations = async (req, res) => {
  try {
    // Fetch items with status 'donating' 
    // Optionally exclude the current user's own items: { userId: { $ne: req.user.id } }
    const donations = await FoodItem.find({ status: 'donating' })
      .populate('userId', 'name') // get donor's name
      .sort({ expiryDate: 1 });
      
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    console.error('[DonationController.getDonations] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching donations' });
  }
};

// @route   POST /api/donations/:id/claim
// @desc    Claim a donation
const claimDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await FoodItem.findById(id);

    if (!item || item.status !== 'donating') {
      return res.status(404).json({ success: false, message: 'Donation not found or no longer available' });
    }

    if (item.userId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own donation' });
    }

    // Update status
    item.status = 'claimed';
    await item.save();

    // Create a notification for the donor
    await Notification.create({
      userId: item.userId,
      type: 'donation_claimed',
      title: 'Donation Claimed!',
      message: `Someone has claimed your donation: ${item.name}`,
      relatedFoodItemId: item._id
    });

    res.status(200).json({ success: true, message: 'Donation claimed successfully!', data: item });
  } catch (error) {
    console.error('[DonationController.claimDonation] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error claiming donation' });
  }
};

module.exports = {
  getDonations,
  claimDonation
};
