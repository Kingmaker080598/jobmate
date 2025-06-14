import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not set - AI features will be disabled.');
}

export const openai = apiKey
  ? new OpenAI({
      apiKey,
      maxRetries: 5,
      timeout: 60000, // 60 seconds timeout
    })
  : null;
