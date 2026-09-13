const SUGGESTIONS = {
  electricity: {
    text: 'Switch to LED bulbs and unplug idle appliances. Consider a solar rooftop.',
    saving_estimate_pct: 0.20
  },
  transport: {
    text: 'Carpool, use public transport, or switch to an EV for daily commutes.',
    saving_estimate_pct: 0.30
  },
  food: {
    text: 'Reduce red meat consumption and prefer locally sourced seasonal produce.',
    saving_estimate_pct: 0.25
  },
  waste: {
    text: 'Compost organic waste and increase recyclable separation at source.',
    saving_estimate_pct: 0.40
  },
  water: {
    text: 'Fix leaky taps and install low-flow fixtures to reduce water heating emissions.',
    saving_estimate_pct: 0.15
  }
};

function getDateRange(daysBack, refDate = new Date()) {
  const end = new Date(refDate);
  const start = new Date(refDate);
  start.setDate(start.getDate() - daysBack);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function getRecommendations(userId, db, periodDays = 30) {
  const current = getDateRange(periodDays);
  const previous = getDateRange(periodDays * 2, new Date(current.start));

  const categories = ['electricity', 'transport', 'food', 'waste', 'water'];

  const query = db.prepare(`
    SELECT category, COALESCE(SUM(co2e_kg), 0) as total
    FROM emission_records
    WHERE user_id = ? AND date(recorded_at) BETWEEN ? AND ?
    GROUP BY category
  `);

  const currentData = {};
  const previousData = {};

  for (const cat of categories) {
    currentData[cat] = 0;
    previousData[cat] = 0;
  }

  for (const row of query.all(userId, current.start, current.end)) {
    currentData[row.category] = row.total;
  }
  for (const row of query.all(userId, previous.start, previous.end)) {
    previousData[row.category] = row.total;
  }

  let maxDelta = -Infinity;
  let topCategory = 'electricity';

  for (const cat of categories) {
    const delta = currentData[cat] - previousData[cat];
    if (delta > maxDelta) {
      maxDelta = delta;
      topCategory = cat;
    }
  }

  const suggestion = SUGGESTIONS[topCategory];
  const estimatedSaving = parseFloat((currentData[topCategory] * suggestion.saving_estimate_pct).toFixed(2));

  return {
    category: topCategory,
    current_co2e: currentData[topCategory],
    previous_co2e: previousData[topCategory],
    delta: parseFloat(maxDelta.toFixed(2)),
    suggestion: suggestion.text,
    estimated_saving_kg: estimatedSaving,
    period_days: periodDays
  };
}

module.exports = { getRecommendations };
