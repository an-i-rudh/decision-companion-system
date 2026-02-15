function generateExplanation(evaluatedOptions) {
  return evaluatedOptions.map(option => {
    let totalScore = 0;

    const breakdown = option.criteriaValues.map(c => {
      const contribution = c.normalized * c.weight;
      totalScore += contribution;

      return {
        criterion: c.criterion,
        rawValue: c.raw,
        normalizedValue: Number(c.normalized.toFixed(4)),
        weight: Number(c.weight.toFixed(4)),
        contribution: Number(contribution.toFixed(4))
      };
    });

    return {
      option: option.name,
      totalScore: Number(totalScore.toFixed(4)),
      breakdown
    };
  });
}

module.exports = { generateExplanation };

results.sort((a, b) => b.totalScore - a.totalScore);

function addInsightSummary(results) {
  if (results.length < 2) return results;

  const top = results[0];
  const second = results[1];

  top.insight = `Ranked first with a margin of ${(top.totalScore - second.totalScore).toFixed(4)} over ${second.option}.`;

  return results;
}
