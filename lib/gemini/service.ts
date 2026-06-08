/**
 * Gemini AI Service
 * Chat uses direct context injection (Supabase profiles → system prompt).
 * RAG store helpers are kept for admin document management.
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GroundingChunk, ChatMessage } from '@/lib/types/database';

let ai: GoogleGenAI | null = null;

export function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

function getAI() {
  return ai ?? initializeGemini();
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── RAG Store helpers (used by admin document management only) ───────────────

export async function createRagStore(displayName: string): Promise<string> {
  const geminiAI = getAI();
  const ragStore = await geminiAI.fileSearchStores.create({ config: { displayName } });
  if (!ragStore.name) throw new Error("Failed to create RAG store: name is missing");
  return ragStore.name;
}

export async function isRagStoreAccessible(ragStoreName: string): Promise<boolean> {
  try {
    const geminiAI = getAI();
    await geminiAI.fileSearchStores.get({ name: ragStoreName });
    return true;
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 404 ||
        error?.error?.status === 'PERMISSION_DENIED' ||
        error?.message?.toLowerCase().includes('permission') ||
        error?.message?.toLowerCase().includes('not exist')) {
      return false;
    }
    return true;
  }
}

export async function uploadToRagStore(
  ragStoreName: string,
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<void> {
  const geminiAI = getAI();
  const uint8Array = new Uint8Array(file);
  const fileObject = new File([new Blob([uint8Array], { type: mimeType })], fileName, { type: mimeType });

  let op = await geminiAI.fileSearchStores.uploadToFileSearchStore({
    fileSearchStoreName: ragStoreName,
    file: fileObject,
  });

  while (!op.done) {
    await delay(3000);
    op = await geminiAI.operations.get({ operation: op });
  }

  if (op.error) {
    throw new Error(`Upload failed: ${op.error.message || 'Unknown error'}`);
  }
}

export async function deleteRagStore(ragStoreName: string): Promise<void> {
  const geminiAI = getAI();
  await geminiAI.fileSearchStores.delete({ name: ragStoreName, config: { force: true } });
}

// ─── Chat: context injection (no RAG stores needed) ──────────────────────────

const CHAT_SYSTEM_PROMPT_PREFIX = `You are Kenavo AI Assistant, a warm and knowledgeable companion for the Kenavo Alumni Directory — Montfort Class of 2000.

Below is the complete alumni database. Use it to answer any questions naturally, as if you personally know these people.

Rules:
- Be friendly and conversational — like a helpful classmate
- Answer directly and concisely
- DO NOT say "according to the data" or "based on the information"
- DO NOT use bullet points unless specifically asked
- If someone asks about a specific person, share what you know warmly
- If information isn't available, say so honestly
- For general questions, summarise relevant alumni naturally

ALUMNI DATABASE:
`;

/**
 * Chat with alumni context injected directly into the system prompt.
 * Works with any Gemini API key — no RAG stores or special permissions needed.
 */
export async function chatWithContext(
  alumniContext: string,
  message: string,
  history: ChatMessage[] = []
): Promise<{ text: string; groundingChunks: GroundingChunk[] }> {
  const geminiAI = getAI();

  const chat = geminiAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHAT_SYSTEM_PROMPT_PREFIX + alumniContext,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    })),
  });

  const response = await chat.sendMessage({ message });

  return {
    text: response.text || "I'm not sure how to answer that. Could you try rephrasing?",
    groundingChunks: [],
  };
}

/**
 * Generate example questions based on actual alumni data.
 * Uses a sample of alumni context so questions reflect real people.
 */
export async function generateExampleQuestions(alumniContext: string): Promise<string[]> {
  const geminiAI = getAI();

  try {
    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Here is a sample of alumni from the Kenavo Directory (Montfort Class of 2000):\n\n${alumniContext}\n\nGenerate 6 short, natural, conversational questions that someone might ask about these alumni — as if chatting with a classmate. Return ONLY a JSON array of strings, no other text. Example: ["Who's working in tech these days?", "Any alumni in Chennai?"]`
        }]
      }],
    });

    if (!response.text) return [];

    let jsonText = response.text.trim();
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch?.[1]) {
      jsonText = jsonMatch[1];
    } else {
      const first = jsonText.indexOf('[');
      const last = jsonText.lastIndexOf(']');
      if (first !== -1 && last > first) jsonText = jsonText.substring(first, last + 1);
    }

    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed.filter(q => typeof q === 'string') : [];
  } catch (error) {
    console.error("Failed to generate example questions:", error);
    return [];
  }
}
