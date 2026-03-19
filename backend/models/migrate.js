/**
 * Iron Paw — Database Migration
 * Creates all tables for the production system.
 * Run with: node models/migrate.js
 */

import pool from './db.js';

const schema = `
-- Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (all inbound contacts)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  project_type VARCHAR(100),
  property_size VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50) DEFAULT 'TN',
  message TEXT,
  status VARCHAR(50) DEFAULT 'New',
  source VARCHAR(100) DEFAULT 'Website',
  assigned_to INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  acreage DECIMAL(10,2),
  vegetation_density VARCHAR(50),
  equipment_type VARCHAR(100),
  terrain VARCHAR(50),
  access_difficulty VARCHAR(50),
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_final DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'Draft',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments / Calendar
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  quote_id INTEGER REFERENCES quotes(id),
  appointment_type VARCHAR(100) DEFAULT 'Estimate',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  status VARCHAR(50) DEFAULT 'Scheduled',
  notes TEXT,
  google_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (confirmed work orders)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  quote_id INTEGER REFERENCES quotes(id),
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  revenue DECIMAL(10,2),
  operator_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations (chat + voice)
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  lead_id INTEGER REFERENCES leads(id),
  channel VARCHAR(50) DEFAULT 'web',
  status VARCHAR(50) DEFAULT 'active',
  current_step VARCHAR(50) DEFAULT 'start',
  acreage VARCHAR(100),
  density VARCHAR(100),
  terrain VARCHAR(100),
  access VARCHAR(100),
  location VARCHAR(100),
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Logs (Twilio / VAPI)
CREATE TABLE IF NOT EXISTS call_logs (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  call_sid VARCHAR(255),
  direction VARCHAR(20) DEFAULT 'inbound',
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  status VARCHAR(50),
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running Iron Paw DB migration...');
    await client.query(schema);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
