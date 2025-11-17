const mongoose = require('mongoose');
const UserInteraction = require('../models/Interaction');


exports.createInteraction = async (req, res) => {
    try {
      const { id } = req.user; // Assuming req.user contains userId
      const { productId, eventType, metadata } = req.body;
  
      // Ensure productId is handled as an array, even for single products
      const productIds = Array.isArray(productId) ? productId : [productId];
  
      // Create a new UserInteraction document
      const newInteraction = await UserInteraction.create({
        userId: id,
        productId: productIds, // Pass as array to handle multiple products
        eventType,
        metadata,
      });
  
      // Save the document to MongoDB
      await newInteraction.save();
      
      res.status(201).json({ success: true, data: newInteraction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

// Get interactions by user ID (GET /interactions/user/:userId)
exports.getUserInteractions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all interactions for a specific user
    const interactions = await UserInteraction.find({ userId: mongoose.Types.ObjectId(userId) });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get interactions for a specific product (GET /interactions/product/:productId)
exports.getProductInteractions = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch all interactions for a specific product
    const interactions = await UserInteraction.find({ productId: mongoose.Types.ObjectId(productId) });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete interaction by ID (DELETE /interactions/:id)
exports.deleteInteraction = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the interaction by ID and delete it
    const interaction = await UserInteraction.findByIdAndDelete(id);

    if (!interaction) {
      return res.status(404).json({ success: false, message: 'Interaction not found' });
    }

    res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get interactions for the last week (GET /interactions/user/:userId/week)
exports.getUserInteractionsForLastWeek = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the date one week ago from now
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch all interactions for the user within the last 7 days
    const interactions = await UserInteraction.find({
      userId: mongoose.Types.ObjectId(userId),
      timestamp: { $gte: oneWeekAgo }
    });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Analyze stock trends for the admin (GET /interactions/trends)
exports.getStockTrends = async (req, res) => {
  try {
    // Fetch the most purchased or viewed products over the last month (or any timeframe)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Group and count interactions by productId to find trends
    const trends = await UserInteraction.aggregate([
      {
        $match: {
          eventType: { $in: ['viewed_product', 'purchased'] },
          timestamp: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: '$productId',
          interactionCount: { $sum: 1 }, // Count how many times a product was interacted with
        },
      },
      {
        $sort: { interactionCount: -1 }, // Sort by highest interaction count
      },
      {
        $limit: 10, // Limit to top 10 trending products
      },
    ]);

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
