import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 8787;
const DB_PATH = process.env.DATABASE_PATH || './data/app.db';
const API_KEY = process.env.SERVICE_API_KEY;

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT
);
CREATE TABLE IF NOT EXISTS diaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  background_color TEXT,
  date_str TEXT,
  time_str TEXT,
  timestamp TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_diaries_user ON diaries(user_id);
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

// super simple API-key check (for MVP private service)
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!API_KEY) return res.status(500).json({ error: 'Server misconfigured: missing SERVICE_API_KEY' });
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Users (MVP: upsert by email)
app.post('/api/users', requireApiKey, (req, res) => {
  const { id, email, displayName } = req.body || {};
  const uid = id || nanoid(12);
  const stmt = db.prepare(`INSERT INTO users(id, email, display_name) VALUES(?,?,?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email, display_name=excluded.display_name`);
  stmt.run(uid, email || null, displayName || null);
  res.json({ id: uid, email, displayName });
});

// Diaries CRUD
app.get('/api/diaries', requireApiKey, (req, res) => {
  const userId = req.query.userId;
  const rows = db.prepare('SELECT * FROM diaries WHERE user_id = ? ORDER BY datetime(timestamp) DESC').all(userId);
  res.json(rows);
});

app.post('/api/diaries', requireApiKey, (req, res) => {
  const d = req.body || {};
  const id = d.id || nanoid(16);
  const stmt = db.prepare(`INSERT INTO diaries(id, user_id, content, background_color, date_str, time_str, timestamp)
                           VALUES(?,?,?,?,?,?,?)`);
  stmt.run(id, d.userId, d.content, d.backgroundColor || null, d.date || null, d.time || null, d.timestamp || new Date().toISOString());
  res.json({ id });
});

app.put('/api/diaries/:id', requireApiKey, (req, res) => {
  const id = req.params.id;
  const d = req.body || {};
  const stmt = db.prepare(`UPDATE diaries SET content=?, background_color=?, date_str=?, time_str=?, timestamp=?, updated_at=datetime('now') WHERE id=?`);
  stmt.run(d.content, d.backgroundColor || null, d.date || null, d.time || null, d.timestamp || new Date().toISOString(), id);
  res.json({ id });
});

app.delete('/api/diaries/:id', requireApiKey, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM diaries WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Generic KV storage (e.g., programs JSON)
app.get('/api/kv/:key', requireApiKey, (req, res) => {
  const key = req.params.key;
  const row = db.prepare('SELECT value FROM kv WHERE key=?').get(key);
  res.json({ key, value: row ? JSON.parse(row.value) : null });
});

app.put('/api/kv/:key', requireApiKey, (req, res) => {
  const key = req.params.key;
  const value = JSON.stringify(req.body ?? {});
  db.prepare('INSERT INTO kv(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value);
  res.json({ key });
});

app.listen(PORT, () => {
  console.log(`API server on http://localhost:${PORT}`);
});