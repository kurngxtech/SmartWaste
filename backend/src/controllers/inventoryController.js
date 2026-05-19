const FoodItem = require('../models/FoodItem');

// @route   GET /api/inventory
// @desc    Get all food items for the logged-in user
const getInventory = async (req, res) => {
  try {
    const items = await FoodItem.find({
      userId: req.user.id,
      status: { $ne: 'completed' }
    }).sort({ expiryDate: 1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('[InventoryController.getInventory] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error retrieving inventory' });
  }
};

// @route   POST /api/inventory
// @desc    Add a new food item
const addFoodItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, purchaseDate, expiryDate, status, notes } = req.body;

    if (!name || !category || quantity == null || !unit || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, category, quantity, unit, expiryDate)' });
    }

    const newItem = new FoodItem({
      userId: req.user.id,
      name,
      category,
      quantity,
      unit,
      purchaseDate,
      expiryDate,
      status: status || 'available',
      notes
    });

    const savedItem = await newItem.save();
    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    console.error('[InventoryController.addFoodItem] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error adding food item' });
  }
};

// @route   PUT /api/inventory/:id
// @desc    Update a food item
const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    let item = await FoodItem.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Ensure the item belongs to the user
    if (item.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this item' });
    }

    item = await FoodItem.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('[InventoryController.updateFoodItem] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating food item' });
  }
};

// @route   DELETE /api/inventory/:id
// @desc    Delete a food item
const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await FoodItem.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Ensure the item belongs to the user
    if (item.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await FoodItem.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Food item removed' });
  } catch (error) {
    console.error('[InventoryController.deleteFoodItem] Error:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting food item' });
  }
};

module.exports = {
  getInventory,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem
};
