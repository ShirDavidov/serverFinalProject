// Mor Yossef - 209514264
// Rinat Polonski - 313530842
// Shir Davidov - 318852159

const express = require("express");
const router = express.Router();
const { generateNewReport } = require("../database/database");


// GET /report
router.get('/', async (req, res) => {
  try {
    const { user_id, month, year } = req.query;
    // Generate the report
    const report = await generateNewReport(user_id, month, year);

    // Send the report as JSON response
    res.json(report);
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
});

module.exports = router;
