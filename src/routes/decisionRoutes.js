const express = require("express");
const router = express.Router();

const { evaluateDecision } = require("../services/decisionEngine");


router.post("/evaluate", (req, res) => {
  try {
    const { name, criteria, options } = req.body;

    if (!criteria || !options) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const result = evaluateDecision({ criteria, options });

    res.json({
      ranking: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

