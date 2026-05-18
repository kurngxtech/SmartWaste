const cron = require('node-cron');
const FoodItem = require('../models/FoodItem');
const Notification = require('../models/Notification');

const startCronJobs = () => {
  // Run every day at 8:00 AM
  // For testing purposes, we can also use '* * * * *' to run every minute
  cron.schedule('0 8 * * *', async () => {
    console.log('[CronService] Running daily expiry scan...');
    try {
      const now = new Date();
      // Look for items expiring in the next 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      const expiringItems = await FoodItem.find({
        status: { $in: ['available'] },
        expiryDate: { $lte: threeDaysFromNow, $gt: now }
      });

      for (const item of expiringItems) {
        // Change status to expiring
        item.status = 'expiring';
        await item.save();

        // Create a notification
        await Notification.create({
          userId: item.userId,
          type: 'expiry_alert',
          title: 'Item Expiring Soon',
          message: `${item.name} is expiring on ${item.expiryDate.toDateString()}`,
          relatedFoodItemId: item._id
        });
      }

      // Also mark items that have actually expired
      const expiredItems = await FoodItem.find({
        status: { $in: ['available', 'expiring'] },
        expiryDate: { $lte: now }
      });

      for (const item of expiredItems) {
        item.status = 'expired';
        await item.save();

        await Notification.create({
          userId: item.userId,
          type: 'expiry_alert',
          title: 'Item Expired',
          message: `${item.name} has expired!`,
          relatedFoodItemId: item._id
        });
      }

      console.log(`[CronService] Expiry scan complete. Expiring items found: ${expiringItems.length}. Expired items found: ${expiredItems.length}.`);
    } catch (error) {
      console.error('[CronService] Error running expiry scan:', error);
    }
  });
};

module.exports = { startCronJobs };
