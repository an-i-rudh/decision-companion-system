function validateInput(options, criteria) {
  if (!Array.isArray(options) || options.length === 0)
    throw new Error("At least one option is required.");

  if (!Array.isArray(criteria) || criteria.length === 0)
    throw new Error("At least one criterion is required.");

  criteria.forEach(c => {
    if (typeof c.weight !== "number")
      throw new Error(`Invalid weight for: ${c.name}`);

    if (!["benefit", "cost"].includes(c.type))
      throw new Error(`Invalid type for: ${c.name}`);
  });
}

function normalizeValue(value, min, max, type) {
  if (max === min) return 1;
  return type === "benefit"
    ? (value - min) / (max - min)
    : (max - value) / (max - min);
}

function evaluateDecision(data) {
  const { options, criteria } = data;

  validateInput(options, criteria);

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  if (totalWeight === 0)
    throw new Error("Total weight cannot be zero.");

  const results = options.map(option => {
    let totalScore = 0;

    const breakdown = criteria.map(criterion => {
      const values = options.map(o => o.values[criterion.name]);

      const min = Math.min(...values);
      const max = Math.max(...values);

      const rawValue = option.values[criterion.name];

      const normalized = normalizeValue(
        rawValue,
        min,
        max,
        criterion.type
      );

      const weightFactor = criterion.weight / totalWeight;
      const contribution = normalized * weightFactor;

      totalScore += contribution;

      return {
        criterion: criterion.name,
        rawValue,
        normalized: Number(normalized.toFixed(4)),
        weight: Number(weightFactor.toFixed(4)),
        contribution: Number(contribution.toFixed(4))
      };
    });

    return {
      optionName: option.name,
      totalScore: Number(totalScore.toFixed(4)),
      breakdown
    };
  });

  results.sort((a, b) => b.totalScore - a.totalScore);

  if (results.length >= 2) {
    const margin = (
      results[0].totalScore - results[1].totalScore
    ).toFixed(4);

    results[0].insight =
      `Ranked #1 with a lead of ${margin} over ${results[1].optionName}.`;
  }

  return results;
}

module.exports = { evaluateDecision };