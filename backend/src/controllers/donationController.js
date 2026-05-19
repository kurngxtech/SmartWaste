const FoodItem = require('../models/FoodItem');
const ClaimRequest = require('../models/ClaimRequest');
const Notification = require('../models/Notification'); // For notifying the donor

// @route   GET /api/donations
// @desc    Get all available donations from the community
const getDonations = async (req, res) => {
  try {
    // Fetch items with status 'donated' (available for claiming)
    const donations = await FoodItem.find({ status: 'donated' })
      .populate('userId', 'name phone')
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

    // Check which donations the current user has already requested (pending only)
    const currentUserId = req.user.id;
    const userRequests = await ClaimRequest.find({
      donationId: { $in: donationIds },
      requesterId: currentUserId,
      status: 'pending'
    });
    const userRequestedMap = {};
    userRequests.forEach(r => { userRequestedMap[r.donationId.toString()] = true; });

    // Attach claimRequestCount, ownerUserId, and hasRequested to each donation
    const enriched = donations.map(d => {
      const obj = d.toObject();
      obj.claimRequestCount = countMap[d._id.toString()] || 0;
      obj.ownerUserId = d.userId?._id?.toString() || d.userId?.toString();
      obj.hasRequested = !!userRequestedMap[d._id.toString()];
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

    // Use findOne with status check to guard against race conditions
    const item = await FoodItem.findById(id);
    if (!item || item.status !== 'donated') {
      return res.status(404).json({ success: false, message: 'Donation not found or no longer available' });
    }

    if (item.userId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot request your own donation' });
    }

    // Check for existing ACTIVE request (pending only — cancelled/rejected don't block)
    const existingRequest = await ClaimRequest.findOne({
      donationId: id,
      requesterId: req.user.id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You have already requested this donation' });
    }

    // If user had a previously cancelled request, remove it so the unique index allows re-creation
    await ClaimRequest.deleteMany({
      donationId: id,
      requesterId: req.user.id,
      status: { $in: ['cancelled', 'rejected'] }
    });

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
    // Handle duplicate key error from unique index (race condition guard)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already requested this donation' });
    }
    console.error('[DonationController.requestClaim] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error submitting claim request' });
  }
};

// @route   DELETE /api/donations/:id/request
// @desc    Cancel (withdraw) a claim request for a donation
const cancelClaimRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await FoodItem.findById(id);
    if (!item || item.status !== 'donated') {
      return res.status(404).json({ success: false, message: 'Donation not found or no longer available' });
    }

    // Find and delete the user's pending request
    // Using delete so the unique index is freed for re-requesting
    const deletedRequest = await ClaimRequest.findOneAndDelete({
      donationId: id,
      requesterId: req.user.id,
      status: 'pending'
    });

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: 'No pending claim request found to cancel' });
    }

    res.status(200).json({ success: true, message: 'Claim request cancelled successfully' });
  } catch (error) {
    console.error('[DonationController.cancelClaimRequest] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error cancelling claim request' });
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

    const requests = await ClaimRequest.find({ donationId: id, status: 'pending' })
      .populate('requesterId', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('[DonationController.getClaimRequests] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching claim requests' });
  }
};

// @route   POST /api/donations/:id/requests/:requestId/confirm
// @desc    Confirm a claim request — transfers the item from donor to claimer
//
// TRANSACTION FLOW (sequential with rollback safety):
//   Step 1: Validate ownership and request status
//   Step 2: Atomically mark donation as 'completed' (prevents double-confirm)
//   Step 3: Clone item to claimer's inventory
//   Step 4: Confirm the claim request + reject others
//   Step 5: Send notifications
const confirmClaimRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;

    // ── Step 1: Validate ──
    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only the owner can confirm
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Guard: item must still be in 'donated' state (prevents double-confirm)
    if (item.status !== 'donated') {
      return res.status(400).json({ success: false, message: 'This donation has already been processed' });
    }

    const claimReq = await ClaimRequest.findById(requestId).populate('requesterId', 'name');
    if (!claimReq || claimReq.donationId.toString() !== id) {
      return res.status(404).json({ success: false, message: 'Claim request not found' });
    }

    if (claimReq.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This claim request has already been processed' });
    }

    const claimerId = claimReq.requesterId._id || claimReq.requesterId;
    const donorId = item.userId;

    // ── Step 2: Atomically mark donation as completed ──
    // Using findOneAndUpdate with status precondition prevents race conditions
    const updatedItem = await FoodItem.findOneAndUpdate(
      { _id: id, status: 'donated' },
      {
        $set: {
          status: 'completed',
          donatedTo: claimerId,
          completedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(409).json({
        success: false,
        message: 'This donation was already confirmed by another action. Please refresh.'
      });
    }

    // ── Step 3: Clone the item into the claimer's inventory ──
    let clonedItem;
    try {
      clonedItem = await FoodItem.create({
        userId: claimerId,
        name: item.name,
        category: item.category,
        quantity: item.donationQuantity || item.quantity,
        unit: item.unit || 'units',
        expiryDate: item.expiryDate,
        status: 'available',
        notes: `Location: Fridge; Note: Received from donation`,
        purchaseDate: new Date(),
        donatedFrom: donorId
      });
    } catch (cloneError) {
      // ROLLBACK Step 2: revert the donation status back to 'donated'
      console.error('[DonationController.confirmClaimRequest] Clone failed, rolling back:', cloneError);
      await FoodItem.findByIdAndUpdate(id, {
        $set: { status: 'donated' },
        $unset: { donatedTo: 1, completedAt: 1 }
      });
      return res.status(500).json({ success: false, message: 'Failed to transfer item. Please try again.' });
    }

    // ── Step 4: Update claim request statuses ──
    // Confirm the selected request
    claimReq.status = 'confirmed';
    claimReq.completedAt = new Date();
    await claimReq.save();

    // Reject all other pending requests for the same donation
    await ClaimRequest.updateMany(
      { donationId: id, _id: { $ne: requestId }, status: 'pending' },
      { $set: { status: 'rejected', completedAt: new Date() } }
    );

    // ── Step 5: Send notifications ──
    try {
      // Notify the confirmed requester
      await Notification.create({
        userId: claimerId,
        type: 'donation_claimed',
        title: 'Donation Received!',
        message: `Your claim for "${item.name}" has been confirmed! The item has been added to your inventory.`,
        relatedFoodItemId: clonedItem._id
      });

      // Notify the donor that transfer is complete
      await Notification.create({
        userId: donorId,
        type: 'donation_claimed',
        title: 'Donation Transferred',
        message: `"${item.name}" has been transferred to ${claimReq.requesterId.name || 'the requester'}. The item has been removed from your inventory.`,
        relatedFoodItemId: item._id
      });
    } catch (notifError) {
      // Notifications are non-critical — log but don't fail the transfer
      console.error('[DonationController.confirmClaimRequest] Notification error (non-critical):', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Item transferred successfully!',
      data: {
        claimRequest: claimReq,
        transferredItem: clonedItem
      }
    });
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

    // Guard: can only cancel items still in 'donated' state
    if (item.status !== 'donated') {
      return res.status(400).json({ success: false, message: 'This donation has already been processed and cannot be cancelled' });
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
      { $set: { status: 'rejected', completedAt: new Date() } }
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
  cancelClaimRequest,
  getClaimRequests,
  confirmClaimRequest,
  cancelDonation
};
