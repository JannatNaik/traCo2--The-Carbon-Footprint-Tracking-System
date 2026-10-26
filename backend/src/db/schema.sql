PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_pic_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_profile (
  user_id INTEGER PRIMARY KEY,
  vehicle_type TEXT,
  fuel_type TEXT,
  vehicle_mileage_kmpl REAL,
  electricity_meter_type TEXT,
  kwh_per_unit REAL DEFAULT 1.0,
  diet_type TEXT,
  location TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  device_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('electricity','gps')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','inactive')),
  last_seen_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emission_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('electricity','transport','food','waste','water')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK(source IN ('manual','hardware')),
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  co2e_kg REAL NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carbon_factors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  fuel_or_source_type TEXT NOT NULL,
  factor_value REAL NOT NULL,
  unit TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(category, fuel_or_source_type)
);

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria_type TEXT NOT NULL,
  criteria_value REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  reward_credits INTEGER NOT NULL DEFAULT 0,
  target_co2e_kg REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS user_challenges (
  user_id INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
