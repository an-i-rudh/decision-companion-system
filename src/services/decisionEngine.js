function validateInput(options, criteria) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("At least one option is required.");
  }

  if (!Array.isArray(criteria) || criteria.length === 0) {
    throw new Error("At least one criterion is required.");
  }

  criteria.forEach((c) => {
    if (typeof c.weight !== "number") {
      throw new Error(`Invalid weight for criterion: ${c.name}`);
    }

    if (!["benefit", "cost"].includes(c.type)) {
      throw new Error(
        `Criterion type must be 'benefit' or 'cost' for: ${c.name}`
      );
    }
  });

  options.forEach((option) => {
    criteria.forEach((criterion) => {
      if (
        option.values[criterion.name] === undefined ||
        option.values[criterion.name] === null
      ) {
        throw new Error(
          `Missing value for criterion '${criterion.name}' in option '${option.name}'`
        );
      }
    });
  });
}


function normalizeWeights(criteria) {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  if (totalWeight === 0) {
    throw new Error("Total weight cannot be zero.");
  }

  return criteria.map((c) => ({
    ...c,
    weight: c.weight / totalWeight,
  }));
}

function getMinMax(options, criterionName) {
  const values = options.map((o) => o.values[criterionName]);

  const min = Math.min(...values);
  const max = Math.max(...values);

  return { min, max };
}

function normalizeValue(value, min, max, type) {
  // If all values equal, avoid division by zero
  if (max === min) {
    return 1;
  }

  if (type === "benefit") {
    return (value - min) / (max - min);
  }

  if (type === "cost") {
    return (max - value) / (max - min);
  }

  throw new Error("Invalid criterion type.");
}

function evaluateDecision(data) {
  const { options, criteria } = data;

  // Step 1: Validate
  validateInput(options, criteria);

  // Step 2: Normalize Weights
  const normalizedCriteria = normalizeWeights(criteria);

  // Step 3: Compute Scores
  const results = options.map((option) => {
    let totalScore = 0;
    const breakdown = [];

    normalizedCriteria.forEach((criterion) => {
      const { min, max } = getMinMax(options, criterion.name);

      const rawValue = option.values[criterion.name];

      const normalized = normalizeValue(
        rawValue,
        min,
        max,
        criterion.type
      );

      const contribution = normalized * criterion.weight;

      totalScore += contribution;

      breakdown.push({
        criterion: criterion.name,
        rawValue,
        min,
        max,
        normalized: Number(normalized.toFixed(4)),
        weight: Number(criterion.weight.toFixed(4)),
        contribution: Number(contribution.toFixed(4)),
      });
    });

    return {
      optionName: option.name,
      totalScore: Number(totalScore.toFixed(4)),
      breakdown,
    };
  });

  // Step 4: Rank (descending)
  results.sort((a, b) => b.totalScore - a.totalScore);

  return results;
}

module.exports = {
  evaluateDecision,
};