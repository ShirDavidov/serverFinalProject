// Mor Yossef - 209514264
// Rinat Polonski - 313530842
// Shir Davidov - 318852159

const express = require("express");
const router = express.Router();
const { addNewCost } = require("../database/database");

// POST /addcost
router.post("/", async (req, res) => {
  try {
    let cost = await addNewCost(
        req.body.user_id,
        req.body.year,
        req.body.month,
        req.body.day,
        req.body.description,
        req.body.category,
        req.body.sum
    );
    res.status(200).json({
      id: cost.id,
      user_id: cost.user_id,
      year: cost.year,
      month: cost.month,
      day: cost.day,
      description: cost.description,
      category: cost.category,
      sum: cost.sum
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
