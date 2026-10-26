function checkAndAwardBadges(userId, db) {
  const badges = db.prepare('SELECT * FROM badges').all();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = now.toISOString().slice(0, 10);

  for (const badge of badges) {
    const alreadyEarned = db.prepare(
      'SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?'
    ).get(userId, badge.id);
    if (alreadyEarned) continue;

    let earned = false;

    if (badge.criteria_type === 'records_count') {
      const count = db.prepare(
        'SELECT COUNT(*) as cnt FROM emission_records WHERE user_id = ?'
      ).get(userId);
      if (count.cnt >= badge.criteria_value) earned = true;

    } else if (badge.criteria_type === 'total_monthly_max') {
      const row = db.prepare(
        'SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND date(recorded_at) BETWEEN ? AND ?'
      ).get(userId, monthStart, monthEnd);
      if (row.total > 0 && row.total <= badge.criteria_value) earned = true;

    } else if (badge.criteria_type === 'transport_monthly_max') {
      const row = db.prepare(
        "SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND category = 'transport' AND date(recorded_at) BETWEEN ? AND ?"
      ).get(userId, monthStart, monthEnd);
      if (row.total > 0 && row.total <= badge.criteria_value) earned = true;

    } else if (badge.criteria_type === 'electricity_monthly_max') {
      const row = db.prepare(
        "SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND category = 'electricity' AND date(recorded_at) BETWEEN ? AND ?"
      ).get(userId, monthStart, monthEnd);
      if (row.total > 0 && row.total <= badge.criteria_value) earned = true;

    } else if (badge.criteria_type === 'waste_monthly_max') {
      const row = db.prepare(
        "SELECT COALESCE(SUM(co2e_kg), 0) as total FROM emission_records WHERE user_id = ? AND category = 'waste' AND date(recorded_at) BETWEEN ? AND ?"
      ).get(userId, monthStart, monthEnd);
      if (row.total > 0 && row.total <= badge.criteria_value) earned = true;
    }

    if (earned) {
      db.prepare(
        'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)'
      ).run(userId, badge.id);
    }
  }
}

module.exports = { checkAndAwardBadges };
