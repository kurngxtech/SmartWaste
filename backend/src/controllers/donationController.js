const FoodItem = require('../models/FoodItem');
const ClaimRequest = require('../models/ClaimRequest');
const Notification = require('../models/Notification'); // For notifying the donor

// @route   GET /api/donations
// @desc    Get all available donations from the community
const getDonations = async (req, res) => {
  try {
    // Fetch items with status 'donated' (the status the frontend sets when user donates)
    const donations = await FoodItem.find({ status: 'donated' })
      .populate('userId', 'name phone') // get donor's name and phone
      .sort({ createdAt: -1 });

    // For each donation, count how many pending claim requests exist
    const donationIds = donations.map(d => d._id);
    const claimCounts = await ClaimRequest.aggregate([
      { $match: { donationId: { $in: donationIds }, status: 'pending' } },
      { $group: { _id: '$donationId', count: { $sum: 1 } } }
    ]);

    // Build a lookup map: donationId -> count
    const countMap = {};
    claimCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

    // Attach claimRequestCount and ownerUserId to each donation
    const enriched = donations.map(d => {
      const obj = d.toObject();
      obj.claimRequestCount = countMap[d._id.toString()] || 0;
      obj.ownerUserId = d.userId?._id?.toString() || d.userId?.toString();
      return obj;
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('[DonationController.getDonations] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching donations' });
  }
};

// @route   POST /api/donations/:id/claim
// @desc    Claim a donation (legacy direct claim — kept for backwards compat)
const claimDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await FoodItem.findById(id);

    if (!item || item.status !== 'donated') {
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

// @route   POST /api/donations/:id/request
// @desc    Submit a claim request for a donation
const requestClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const item = await FoodItem.findById(id);
    if (!item || item.status !== 'donated') {
      return res.status(404).json({ success: false, message: 'Donation not found or no longer available' });
    }

    if (item.userId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot request your own donation' });
    }

    // Check for existing request
    const existingRequest = await ClaimRequest.findOne({ donationId: id, requesterId: req.user.id });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You have already requested this donation' });
    }

    const claimReq = await ClaimRequest.create({
      donationId: id,
      requesterId: req.user.id,
      message: message || ''
    });

    // Notify the donor that someone is interested
    await Notification.create({
      userId: item.userId,
      type: 'donation_claimed',
      title: 'New Claim Request',
      message: `Someone has requested to claim your donation: ${item.name}`,
      relatedFoodItemId: item._id
    });

    res.status(201).json({ success: true, message: 'Claim request submitted!', data: claimReq });
  } catch (error) {
    console.error('[DonationController.requestClaim] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error submitting claim request' });
  }
};

// @route   GET /api/donations/:id/requests
// @desc    Get all claim requests for a specific donation (only the donor can view)
const getClaimRequests = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only the owner can see who requested
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view requests for this donation' });
    }

    const requests = await ClaimRequest.find({ donationId: id })
      .populate('requesterId', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('[DonationController.getClaimRequests] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching claim requests' });
  }
};

// @route   POST /api/donations/:id/requests/:requestId/confirm
// @desc    Confirm a claim request (donor approves a requester)
const confirmClaimRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;

    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only the owner can confirm
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const claimReq = await ClaimRequest.findById(requestId).populate('requesterId', 'name');
    if (!claimReq || claimReq.donationId.toString() !== id) {
      return res.status(404).json({ success: false, message: 'Claim request not found' });
    }

    // Confirm this request
    claimReq.status = 'confirmed';
    await claimReq.save();

    // Reject all other pending requests for the same donation
    await ClaimRequest.updateMany(
      { donationId: id, _id: { $ne: requestId }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    // Update the donation item status to claimed
    item.status = 'claimed';
    await item.save();

    // Notify the confirmed requester
    await Notification.create({
      userId: claimReq.requesterId._id || claimReq.requesterId,
      type: 'donation_claimed',
      title: 'Claim Request Confirmed!',
      message: `Your claim request for "${item.name}" has been confirmed by the donor. Please arrange pickup.`,
      relatedFoodItemId: item._id
    });

    res.status(200).json({ success: true, message: 'Claim request confirmed!', data: claimReq });
  } catch (error) {
    console.error('[DonationController.confirmClaimRequest] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error confirming claim request' });
  }
};

// @route   POST /api/donations/:id/cancel
// @desc    Cancel a donation (only the donor can cancel)
const cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this donation' });
    }

    const cancelledQty = item.donationQuantity || item.quantity;

    // Try to find the original 'available' item with the same name, category, and user
    // so we can merge the donated quantity back into it
    const originalItem = await FoodItem.findOne({
      _id: { $ne: item._id },
      userId: item.userId,
      name: item.name,
      category: item.category,
      status: { $in: ['available', 'expiring'] }
    });

    if (originalItem) {
      // Merge: add the donated quantity back to the original item
      originalItem.quantity += cancelledQty;
      await originalItem.save();

      // Delete the donated duplicate entry
      await FoodItem.findByIdAndDelete(item._id);
    } else {
      // No matching original found — just revert this item to available
      item.status = 'available';
      item.donationQuantity = 0;
      item.pickupDate = undefined;
      item.pickupTime = undefined;
      item.contactPhone = undefined;
      item.pickupLocation = undefined;
      await item.save();
    }

    // Reject all pending claim requests
    await ClaimRequest.updateMany(
      { donationId: id, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    res.status(200).json({ success: true, message: 'Donation cancelled and returned to inventory.' });
  } catch (error) {
    console.error('[DonationController.cancelDonation] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error cancelling donation' });
  }
};

module.exports = {
  getDonations,
  claimDonation,
  requestClaim,
  getClaimRequests,
  confirmClaimRequest,
  cancelDonation
};
