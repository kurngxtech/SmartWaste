const express = require('express');
const router = express.Router();
const { getDonations, claimDonation } = require('../controllers/donationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getDonations);
router.post('/:id/claim', claimDonation);

module.exports = router;
