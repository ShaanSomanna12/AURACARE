import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Referral } from '../types/database.types';

// Initialize the Gemini API using the environment variable
// We use a try-catch so the app doesn't crash if the key isn't provided yet
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

export async function generatePreArrivalBriefing(referral: Referral): Promise<string> {
  const genAI = getAI();
  if (!genAI) {
    return '⚠️ AI Briefing Offline: GEMINI_API_KEY not configured. Please initialize trauma bay based on standard protocols.';
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an elite trauma AI assistant for a hospital Command Center.
    A doctor has just accepted an emergency inbound patient transfer.
    
    Patient Status:
    - Triage Level: ${referral.triage_status}
    - Symptoms: ${referral.symptoms}
    - Blood Requested: ${referral.requested_blood_units} units of ${referral.requested_blood_type || 'any type'}

    Generate a highly tactical, 3-bullet-point "Pre-Arrival Briefing" for the hospital staff to prepare before the ambulance arrives.
    Keep it strictly medical, extremely concise, and imperative (e.g., "1. Thaw 4 units O- blood. 2. Page Ortho trauma surgeon...").
    Do not include any pleasantries or intro text. Just the 3 numbered bullet points.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini AI Generation Error:', error);
    return '⚠️ Error generating AI Briefing. Proceed with standard trauma protocols.';
  }
}
