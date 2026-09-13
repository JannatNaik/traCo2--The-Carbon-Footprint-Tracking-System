/**
 * Calculate CO2e from a carbon_factors DB lookup.
 * NEVER hardcode factor values here — always query the DB.
 */
function calculateCO2e(category, sourceType, value, db) {
  const row = db.prepare(
    'SELECT factor_value FROM carbon_factors WHERE category = ? AND fuel_or_source_type = ?'
  ).get(category, sourceType);

  if (!row) {
    throw new Error(`No carbon factor found for category='${category}' source='${sourceType}'`);
  }

  return parseFloat((value * row.factor_value).toFixed(4));
}

module.exports = { calculateCO2e };
