// Express backend entry point for string storage with PostgreSQL
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();


console.log('Starting Express app...');
const app = express();
app.use(cors());
app.use(express.json());
console.log('Express app configured.');


console.log('Creating PostgreSQL pool...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/transmart'
});
console.log('PostgreSQL pool created.');


console.log('Creating tables if not exist...');
pool.query(`CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  product_group TEXT,
  source_language TEXT,
  target_languages JSONB,
  terms JSONB,
  glossary JSONB,
  translation_memory JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)`);

pool.query(`CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  lang_code TEXT,
  vendor_id TEXT,
  translator_id TEXT,
  term_ids JSONB,
  status TEXT,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP
)`);

pool.query(`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  status TEXT,
  avatar_url TEXT,
  cost_per_word NUMERIC,
  agency_id TEXT
)`);

console.log('Tables created (if not exist).');

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


// PROJECTS CRUD
app.get('/api/projects', async (req, res) => {
  const result = await pool.query('SELECT * FROM projects ORDER BY id');
  res.json(result.rows);
});
app.post('/api/projects', async (req, res) => {
  const { name, description, productGroup, sourceLanguage, targetLanguages, terms, glossary, translationMemory } = req.body;
  const result = await pool.query(
    'INSERT INTO projects (name, description, product_group, source_language, target_languages, terms, glossary, translation_memory) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [name, description, productGroup, sourceLanguage, JSON.stringify(targetLanguages), JSON.stringify(terms), JSON.stringify(glossary), JSON.stringify(translationMemory)]
  );
  res.json(result.rows[0]);
});
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, productGroup, sourceLanguage, targetLanguages, terms, glossary, translationMemory } = req.body;
  const result = await pool.query(
    'UPDATE projects SET name=$1, description=$2, product_group=$3, source_language=$4, target_languages=$5, terms=$6, glossary=$7, translation_memory=$8 WHERE id=$9 RETURNING *',
    [name, description, productGroup, sourceLanguage, JSON.stringify(targetLanguages), JSON.stringify(terms), JSON.stringify(glossary), JSON.stringify(translationMemory), id]
  );
  res.json(result.rows[0]);
});
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  res.json({ success: true });
});

// JOBS CRUD
app.get('/api/jobs', async (req, res) => {
  const result = await pool.query('SELECT * FROM jobs ORDER BY id');
  res.json(result.rows);
});
app.post('/api/jobs', async (req, res) => {
  const { name, projectId, langCode, vendorId, translatorId, termIds, status, instructions, dueDate } = req.body;
  const result = await pool.query(
    'INSERT INTO jobs (name, project_id, lang_code, vendor_id, translator_id, term_ids, status, instructions, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [name, projectId, langCode, vendorId, translatorId, JSON.stringify(termIds), status, instructions, dueDate]
  );
  res.json(result.rows[0]);
});
app.put('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { name, projectId, langCode, vendorId, translatorId, termIds, status, instructions, dueDate } = req.body;
  const result = await pool.query(
    'UPDATE jobs SET name=$1, project_id=$2, lang_code=$3, vendor_id=$4, translator_id=$5, term_ids=$6, status=$7, instructions=$8, due_date=$9 WHERE id=$10 RETURNING *',
    [name, projectId, langCode, vendorId, translatorId, JSON.stringify(termIds), status, instructions, dueDate, id]
  );
  res.json(result.rows[0]);
});
app.delete('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
  res.json({ success: true });
});

// USERS CRUD
app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows);
});
app.post('/api/users', async (req, res) => {
  const { email, name, role, status, avatarUrl, costPerWord, agencyId } = req.body;
  const result = await pool.query(
    'INSERT INTO users (email, name, role, status, avatar_url, cost_per_word, agency_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [email, name, role, status, avatarUrl, costPerWord, agencyId]
  );
  res.json(result.rows[0]);
});
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, name, role, status, avatarUrl, costPerWord, agencyId } = req.body;
  const result = await pool.query(
    'UPDATE users SET email=$1, name=$2, role=$3, status=$4, avatar_url=$5, cost_per_word=$6, agency_id=$7 WHERE id=$8 RETURNING *',
    [email, name, role, status, avatarUrl, costPerWord, agencyId, id]
  );
  res.json(result.rows[0]);
});
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ success: true });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
