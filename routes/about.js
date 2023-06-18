// Mor Yossef - 209514264
// Rinat Polonski - 313530842
// Shir Davidov - 318852159

const express = require("express");
const router = express.Router();

// Create a JSON array of objects that describe the developers and return it
//GET /about
router.get("/", (req, res, next) => {
  const developers = [
    {
      firstname: "mor",
      lastname: "yossef",
      id: 209514264,
      email: "moryossef98@gmail.com",
    },
    {
      firstname: "rinat",
      lastname: "polonski",
      id: 313530842,
      email: "rinat493@gmail.com",
    },
    {
      firstname: "shir",
      lastname: "davidov",
      id: 318852159,
      email: "sdavidove@gmail.com",
    },
  ];
  try {
    // send the json array
    res.send(developers);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
