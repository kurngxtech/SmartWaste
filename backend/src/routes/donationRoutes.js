const express = require('express');
const router = express.Router();
const {
  getDonations,
  claimDonation,
  requestClaim,
  getClaimRequests,
  confirmClaimRequest,
  cancelDonation
} = require('../controllers/donationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getDonations);
router.post('/:id/claim', claimDonation);
router.post('/:id/request', requestClaim);
router.get('/:id/requests', getClaimRequests);
router.post('/:id/requests/:requestId/confirm', confirmClaimRequest);
router.post('/:id/cancel', cancelDonation);

module.exports = router;
