/**
 * Voice webhook routes — Twilio + ElevenLabs TTS
 *
 * During peak hours (7am–midnight): ElevenLabs voices Chuck and Scout are used.
 * During off-peak hours (midnight–7am): falls back to Twilio's native TTS
 * to prevent burning ElevenLabs quota overnight.
 */

import express from 'express';
import twilio from 'twilio';
import { generateTTS, QuotaExceededError, OffPeakError, VOICES } from '../services/tts.js';

const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * GET /api/voice/tts/:voiceName
 * Streams ElevenLabs audio. Called by Twilio <Play> during peak hours.
 * Query param: text
 */
router.get('/tts/:voiceName', async (req, res) => {
  const { voiceName } = req.params;
  const text = req.query.text;

  if (!text) return res.status(400).end();

  const voiceId = VOICES[voiceName];
  if (!voiceId) return res.status(404).end();

  try {
    const audio = await generateTTS(text, voiceId, voiceName);
    res.set('Content-Type', 'audio/mpeg').send(audio);
  } catch (err) {
    if (err instanceof OffPeakError || err instanceof QuotaExceededError) {
      console.warn(`[Voice] ${err.message}`);
    } else {
      console.error('[Voice] TTS error:', err.message);
    }
    res.status(503).end();
  }
});

/**
 * POST /api/voice/incoming
 * Twilio webhook for inbound calls.
 */
router.post('/incoming', (req, res) => {
  const twiml = new VoiceResponse();
  const text = "Hi, this is Chuck from Iron Paw Forestry. How can I help you today?";
  const baseUrl = process.env.BASE_URL;

  const hour = new Date().getHours();
  const isPeak = hour >= 7;

  if (isPeak && baseUrl) {
    const ttsUrl = `${baseUrl}/api/voice/tts/chuck?text=${encodeURIComponent(text)}`;
    twiml.play(ttsUrl);
  } else {
    if (!isPeak) {
      console.log('[Voice] Off-peak hours — using Twilio TTS to preserve ElevenLabs quota');
    }
    twiml.say({ voice: 'Polly.Matthew-Neural' }, text);
  }

  res.type('text/xml').send(twiml.toString());
});

export default router;
