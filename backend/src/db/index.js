/**
 * SQLite database singleton using Node.js built-in node:sqlite (Node v22.5+).
 * API mirrors better-sqlite3: .prepare(sql).get(...), .all(...), .run(...), .exec(sql)
 * so all route files remain unchanged.
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || './data/traco2.db';
const dbDir = path.dirname(path.resolve(DB_PATH));

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const _db = new DatabaseSync(path.resolve(DB_PATH));

// Enable WAL mode and foreign keys
_db.exec("PRAGMA journal_mode = WAL");
_db.exec("PRAGMA foreign_keys = ON");

// Run schema on first boot
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
_db.exec(schema);

/**
 * Thin wrapper that adapts node:sqlite StatementSync to the better-sqlite3
 * interface used throughout the codebase (.get, .all, .run, transaction).
 */
class Statement {
  constructor(stmt) {
    this._stmt = stmt;
  }

  get(...args) {
    this._stmt.setReadBigInts(false);
    const rows = this._stmt.all(...args);
    return rows.length > 0 ? rows[0] : undefined;
  }

  all(...args) {
    this._stmt.setReadBigInts(false);
    return this._stmt.all(...args);
  }

  run(...args) {
    const result = this._stmt.run(...args);
    return {
      changes: result.changes,
      lastInsertRowid: Number(result.lastInsertRowid)
    };
  }
}

const db = {
  prepare(sql) {
    return new Statement(_db.prepare(sql));
  },
  exec(sql) {
    return _db.exec(sql);
  },
  /**
   * Mimics better-sqlite3 transaction() — wraps a function in BEGIN/COMMIT.
   */
  transaction(fn) {
    return (...args) => {
      _db.exec('BEGIN');
      try {
        const result = fn(...args);
        _db.exec('COMMIT');
        return result;
      } catch (err) {
        _db.exec('ROLLBACK');
        throw err;
      }
    };
  }
};

module.exports = db;
