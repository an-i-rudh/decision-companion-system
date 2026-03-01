const express = require("express");
const router = express.Router();
const { evaluateDecision } = require("../services/decisionEngine");
const repo = require("../repository/decisionRepository");

router.post("/evaluate", async (req, res) => {
  try {
    const { name, criteria, options } = req.body;

    if (!criteria || !options) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // 1. Calculate the result using Pure Logic
    const ranking = evaluateDecision({ criteria, options });

    // 2. Persist to SQLite Database
    const decisionId = repo.createDecision(name || "Untitled Decision");
    const criterionIds = repo.insertCriteria(decisionId, criteria);
    const optionIds = repo.insertOptions(decisionId, options);

    // Prepare matrix for DB: Map option values to the order of criterionIds
    const valuesMatrix = options.map(opt => 
      criteria.map(crit => opt.values[crit.name] || 0)
    );
    
    repo.insertOptionValues(optionIds, criterionIds, valuesMatrix);

    // 3. Return results to Frontend
    res.json({ ranking, decisionId });

  } catch (error) {
    console.error("Evaluation Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;