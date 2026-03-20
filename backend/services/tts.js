/**
 * ElevenLabs TTS Service
 *
 * Off-peak hours (midnight–6:59 AM server time): Chuck and Scout are suspended
 * to preserve ElevenLabs quota. Callers receive Twilio's native TTS instead.
 */

export const VOICES = {
  chuck: process.env.ELEVENLABS_CHUCK_VOICE_ID || 'dag0x2dW9i5XIWwJ5KlD',
  scout: process.env.ELEVENLABS_SCOUT_VOICE_ID || '',
};

// Peak hours: 7:00 AM – 11:59 PM (server local time)
function isPeakHour() {
  return new Date().getHours() >= 7;
}

export class QuotaExceededError extends Error {
  constructor(detail) {
    super(detail?.message || 'ElevenLabs quota exceeded');
    this.name = 'QuotaExceededError';
    this.remaining = detail?.message?.match(/(\d+) credits remaining/)?.[1];
  }
}

export class OffPeakError extends Error {
  constructor(voiceName) {
    super(`ElevenLabs TTS suspended for '${voiceName}' during off-peak hours (midnight–7am)`);
    this.name = 'OffPeakError';
  }
}

/**
 * Generate TTS audio via ElevenLabs.
 * Throws OffPeakError during midnight–7am to preserve quota.
 * Throws QuotaExceededError on 401 quota_exceeded from ElevenLabs.
 *
 * @param {string} text - Text to synthesize
 * @param {string} voiceId - ElevenLabs voice ID
 * @param {string} voiceName - Human-readable name for logging
 * @returns {Promise<Buffer>} MP3 audio buffer
 */
export async function generateTTS(text, voiceId, voiceName) {
  if (!isPeakHour()) {
    throw new OffPeakError(voiceName);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 && err?.detail?.status === 'quota_exceeded') {
      console.error(`[TTS] Quota exceeded for '${voiceName}' — ${err.detail.message}`);
      throw new QuotaExceededError(err.detail);
    }
    throw new Error(
      `ElevenLabs TTS failed for ${voiceName} (voice ${voiceId}): ${res.status} — ${JSON.stringify(err)}`
    );
  }

  return Buffer.from(await res.arrayBuffer());
}
