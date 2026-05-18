const express = require('express');
const router = express.Router();
const {
  getInventory,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem
} = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');

// All inventory routes are protected by authentication
router.use(protect);

router.route('/')
  .get(getInventory)
  .post(addFoodItem);

router.route('/:id')
  .put(updateFoodItem)
  .delete(deleteFoodItem);

module.exports = router;
