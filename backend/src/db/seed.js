const bcrypt = require('bcryptjs');
const db = require('./index');

console.log('Seeding database...');

// Carbon factors (sourced from legacy JSP files + CEA India standard)
const factors = [
  // Electricity
  { category: 'electricity', fuel_or_source_type: 'grid',        factor_value: 0.82, unit: 'kg CO2e/kWh' },
  { category: 'electricity', fuel_or_source_type: 'coal',        factor_value: 0.80, unit: 'kg CO2e/kWh' },
  { category: 'electricity', fuel_or_source_type: 'natural_gas', factor_value: 0.40, unit: 'kg CO2e/kWh' },
  { category: 'electricity', fuel_or_source_type: 'renewable',   factor_value: 0.10, unit: 'kg CO2e/kWh' },
  { category: 'electricity', fuel_or_source_type: 'solar',       factor_value: 0.05, unit: 'kg CO2e/kWh' },
  // Transport
  { category: 'transport', fuel_or_source_type: 'petrol',  factor_value: 2.31, unit: 'kg CO2e/L' },
  { category: 'transport', fuel_or_source_type: 'diesel',  factor_value: 2.68, unit: 'kg CO2e/L' },
  { category: 'transport', fuel_or_source_type: 'electric',factor_value: 0.00, unit: 'kg CO2e/L' },
  { category: 'transport', fuel_or_source_type: 'cng',     factor_value: 1.96, unit: 'kg CO2e/L' },
  // Food (kg CO2e per day)
  { category: 'food', fuel_or_source_type: 'vegan',           factor_value: 2.00, unit: 'kg CO2e/day' },
  { category: 'food', fuel_or_source_type: 'vegetarian',      factor_value: 2.50, unit: 'kg CO2e/day' },
  { category: 'food', fuel_or_source_type: 'non-vegetarian',  factor_value: 5.00, unit: 'kg CO2e/day' },
  { category: 'food', fuel_or_source_type: 'mixed',           factor_value: 3.50, unit: 'kg CO2e/day' },
  // Waste (kg CO2e per kg waste)
  { category: 'waste', fuel_or_source_type: 'general',    factor_value: 2.50, unit: 'kg CO2e/kg' },
  { category: 'waste', fuel_or_source_type: 'organic',    factor_value: 1.20, unit: 'kg CO2e/kg' },
  { category: 'waste', fuel_or_source_type: 'recyclable', factor_value: 0.50, unit: 'kg CO2e/kg' },
  // Water (kg CO2e per litre)
  { category: 'water', fuel_or_source_type: 'tap',    factor_value: 0.000344, unit: 'kg CO2e/L' },
  { category: 'water', fuel_or_source_type: 'bottled', factor_value: 0.000544, unit: 'kg CO2e/L' },
];

const insertFactor = db.prepare(`
  INSERT OR IGNORE INTO carbon_factors (category, fuel_or_source_type, factor_value, unit)
  VALUES (@category, @fuel_or_source_type, @factor_value, @unit)
`);

const seedFactors = db.transaction(() => {
  for (const f of factors) insertFactor.run(f);
});
seedFactors();
console.log(`Seeded ${factors.length} carbon factors`);

// Badges
const badges = [
  { name: 'Eco Starter',    description: 'Logged your first emission record',  icon: '🌱', criteria_type: 'records_count',   criteria_value: 1 },
  { name: 'Green Commuter', description: 'Kept transport CO2e under 50 kg/month', icon: '🚲', criteria_type: 'transport_monthly_max', criteria_value: 50 },
  { name: 'Energy Saver',   description: 'Electricity CO2e under 80 kg/month', icon: '⚡', criteria_type: 'electricity_monthly_max', criteria_value: 80 },
  { name: 'Eco Champion',   description: 'Total CO2e under 150 kg in a month', icon: '🏆', criteria_type: 'total_monthly_max', criteria_value: 150 },
  { name: 'Zero Waster',    description: 'Waste CO2e under 10 kg/month',       icon: '♻️', criteria_type: 'waste_monthly_max',  criteria_value: 10 },
];

const insertBadge = db.prepare(`
  INSERT OR IGNORE INTO badges (name, description, icon, criteria_type, criteria_value)
  VALUES (@name, @description, @icon, @criteria_type, @criteria_value)
`);

const seedBadges = db.transaction(() => {
  for (const b of badges) insertBadge.run(b);
});
seedBadges();
console.log(`Seeded ${badges.length} badges`);

// Demo challenges
const challenges = [
  { title: 'Low Carbon Month', description: 'Keep total CO2e under 200 kg this month', start_date: '2026-09-01', end_date: '2026-09-30', reward_credits: 100, target_co2e_kg: 200 },
  { title: 'Green Commute Week', description: 'Keep transport CO2e under 20 kg this week', start_date: '2026-09-13', end_date: '2026-09-20', reward_credits: 50, target_co2e_kg: 20 },
];

const insertChallenge = db.prepare(`
  INSERT OR IGNORE INTO challenges (title, description, start_date, end_date, reward_credits, target_co2e_kg)
  VALUES (@title, @description, @start_date, @end_date, @reward_credits, @target_co2e_kg)
`);

const seedChallenges = db.transaction(() => {
  for (const c of challenges) insertChallenge.run(c);
});
seedChallenges();
console.log(`Seeded ${challenges.length} challenges`);

// Demo admin
const adminHash = bcrypt.hashSync('Admin@1234', 10);
db.prepare(`INSERT OR IGNORE INTO admins (name, email, password_hash) VALUES (?, ?, ?)`)
  .run('Super Admin', 'admin@traco2.local', adminHash);
console.log('Seeded demo admin: admin@traco2.local / Admin@1234');

// Demo user
const userHash = bcrypt.hashSync('User@1234', 10);
const userResult = db.prepare(`INSERT OR IGNORE INTO users (name, email, password_hash) VALUES (?, ?, ?)`)
  .run('Demo User', 'demo@traco2.local', userHash);
if (userResult.changes > 0) {
  const userId = userResult.lastInsertRowid;
  db.prepare(`INSERT OR IGNORE INTO user_profile (user_id, vehicle_type, fuel_type, vehicle_mileage_kmpl, diet_type) VALUES (?, ?, ?, ?, ?)`)
    .run(userId, 'Car', 'petrol', 15, 'mixed');
  console.log('Seeded demo user: demo@traco2.local / User@1234');
}

console.log('Seeding complete!');
process.exit(0);
