/**
 * Iron Paw Land Clearing & Forestry
 * Production Backend — Express + PostgreSQL
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { apiLimiter } from './middleware/rateLimit.js';
import leadsRouter from './routes/leads.js';
import quotesRouter from './routes/quotes.js';
import appointmentsRouter from './routes/appointments.js';
import conversationsRouter from './routes/conversations.js';
import jobsRouter from './routes/jobs.js';
import analyticsRouter from './routes/analytics.js';
import voiceRouter from './routes/voice.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Global rate limit
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ironpaw-api', ts: new Date().toISOString() });
});

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/voice', voiceRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Iron Paw API running on port ${PORT}`);
});
