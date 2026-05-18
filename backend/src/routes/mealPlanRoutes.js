const express = require('express');
const router = express.Router();
const {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan
} = require('../controllers/mealPlanController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

router.route('/:id')
  .put(updateMealPlan)
  .delete(deleteMealPlan);

module.exports = router;
