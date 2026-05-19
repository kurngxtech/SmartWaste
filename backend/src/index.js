require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic Test Route (Phase 2)
app.get('/api/test', (req, res) => {
  res.json({ message: 'backend works' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/mealplans', require('./routes/mealPlanRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Start Cron Jobs (UC5 Expiry Scanner)
const { startCronJobs } = require('./services/cronService');
startCronJobs();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
