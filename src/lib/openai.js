import { OpenAI } from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 5,
  timeout: 60000, // 60 seconds timeout (increased from 30 seconds)
});