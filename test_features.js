require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const FoodItem = require('./backend/src/models/FoodItem');
const MealPlan = require('./backend/src/models/MealPlan');
const Notification = require('./backend/src/models/Notification');
const ClaimRequest = require('./backend/src/models/ClaimRequest');
const bcrypt = require('bcryptjs');

async function testSyncAndCascadeDelete() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Database');

  const email = `test_delete_${Date.now()}@example.com`;

  // 1. Create a test user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = new User({
    name: 'Test Delete User',
    email,
    passwordHash,
    householdSize: 2,
    isVerified: true,
  });
  await user.save();
  console.log(`Created test user: ${user._id} (${email})`);

  // 2. Create food items
  const item1 = new FoodItem({
    userId: user._id,
    name: 'Apple',
    category: 'Fruit',
    quantity: 5,
    unit: 'pcs',
    expiryDate: new Date(Date.now() + 86400000 * 5),
    status: 'available',
  });
  await item1.save();

  const item2 = new FoodItem({
    userId: user._id,
    name: 'Banana',
    category: 'Fruit',
    quantity: 1,
    unit: 'pcs',
    expiryDate: new Date(Date.now() + 86400000 * 2),
    status: 'available',
  });
  await item2.save();

  console.log('Created 2 food items for user');

  // 3. Create a meal plan - this simulates the backend endpoint
  // Simulating createMealPlan controller logic
  const mockIngredients = [
    { itemId: item1._id, itemName: item1.name, quantity: 2 }, // quantity reduced to 3, status -> claimed
    { itemId: item2._id, itemName: item2.name, quantity: 1 }, // quantity reduced to 0, status -> used
  ];

  const mealPlan = new MealPlan({
    userId: user._id,
    name: 'Fruit Salad',
    day: 'Mon',
    slot: 'Breakfast',
    date: '2026-05-20',
    ingredients: mockIngredients,
    reminderEnabled: false,
  });
  await mealPlan.save();
  console.log('Created meal plan');

  // Perform quantity decrement and status update as done in createMealPlan
  for (const ing of mockIngredients) {
    const updated = await FoodItem.findByIdAndUpdate(
      ing.itemId,
      { $inc: { quantity: -ing.quantity } },
      { returnDocument: 'after' },
    );
    if (updated) {
      if (updated.quantity <= 0) {
        updated.status = 'used';
      } else {
        updated.status = 'claimed';
      }
      await updated.save();
    }
  }

  // 4. Verify Sync behavior
  const checkItem1 = await FoodItem.findById(item1._id);
  const checkItem2 = await FoodItem.findById(item2._id);

  console.log(`\n--- Verification of Sync Behavior ---`);
  console.log(`Apple quantity expected 3, got: ${checkItem1.quantity}`);
  console.log(`Apple status expected 'claimed', got: '${checkItem1.status}'`);
  console.log(`Banana quantity expected 0, got: ${checkItem2.quantity}`);
  console.log(`Banana status expected 'used', got: '${checkItem2.status}'`);

  if (
    checkItem1.quantity === 3 &&
    checkItem1.status === 'claimed' &&
    checkItem2.quantity === 0 &&
    checkItem2.status === 'used'
  ) {
    console.log('✅ SYNC VERIFICATION PASSED!');
  } else {
    console.error('❌ SYNC VERIFICATION FAILED!');
  }

  // 5. Create some notifications and claims to verify cascade delete
  const notif = new Notification({
    userId: user._id,
    title: 'Reminder',
    message: 'Test reminder',
    type: 'general',
  });
  await notif.save();

  const claim = new ClaimRequest({
    requesterId: user._id,
    donationId: item1._id,
    status: 'pending',
  });
  await claim.save();
  console.log('Created test notification and claim request');

  // 6. Simulate Delete Account Controller Logic
  console.log('\n--- Simulating Deletion of Account ---');
  // Find all food items owned by the user
  const userFoodItems = await FoodItem.find({ userId: user._id }).select('_id');
  const foodItemIds = userFoodItems.map((item) => item._id);

  // Delete related claim requests (where user is requester OR donation belongs to user)
  await ClaimRequest.deleteMany({
    $or: [{ requesterId: user._id }, { donationId: { $in: foodItemIds } }],
  });

  // Delete user's food items/donations
  await FoodItem.deleteMany({ userId: user._id });

  // Delete user's meal plans
  await MealPlan.deleteMany({ userId: user._id });

  // Delete user's notifications
  await Notification.deleteMany({ userId: user._id });

  // Delete the user account itself
  await User.findByIdAndDelete(user._id);

  // 7. Verify deletion has occurred successfully
  const countUsers = await User.countDocuments({ _id: user._id });
  const countFoodItems = await FoodItem.countDocuments({ userId: user._id });
  const countMealPlans = await MealPlan.countDocuments({ userId: user._id });
  const countNotifications = await Notification.countDocuments({ userId: user._id });
  const countClaims = await ClaimRequest.countDocuments({
    $or: [{ requesterId: user._id }, { donationId: { $in: foodItemIds } }],
  });

  console.log(`User document count: ${countUsers}`);
  console.log(`FoodItem document count: ${countFoodItems}`);
  console.log(`MealPlan document count: ${countMealPlans}`);
  console.log(`Notification document count: ${countNotifications}`);
  console.log(`ClaimRequest document count: ${countClaims}`);

  if (
    countUsers === 0 &&
    countFoodItems === 0 &&
    countMealPlans === 0 &&
    countNotifications === 0 &&
    countClaims === 0
  ) {
    console.log('✅ CASCADE DELETION VERIFICATION PASSED!');
  } else {
    console.error('❌ CASCADE DELETION VERIFICATION FAILED!');
  }

  await mongoose.disconnect();
}

testSyncAndCascadeDelete().catch(console.error);
