"use server";

import { GoogleGenAI } from "@google/genai";
import { Logging } from "@google-cloud/logging";
import { ErrorReporting } from "@google-cloud/error-reporting";

/**
 * PRODUCTION-GRADE OBSERVABILITY SETUP
 * -----------------------------------
 * We use Google Cloud Logging for request tracking and Error Reporting 
 * to automatically capture and notify us of any server-side failures.
 */
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Google Cloud Logging
const logging = new Logging({ projectId });
const log = logging.log("ai-assistant-logs");

// Initialize Google Cloud Error Reporting
const errors = new ErrorReporting({ projectId });

/**
 * Type definition for the AI Assistant's standard response.
 * Standardizing this ensures the frontend can reliably handle all states.
 */
export interface AIResponse {
  error: string | null;
  answer: string | null;
}

/**
 * AI CLIENT INITIALIZATION
 * ------------------------
 * We use the unified Google Gen AI SDK in Vertex AI mode.
 * This is the most secure method for Cloud Run as it uses the Service Account's 
 * identity instead of static API keys.
 */
const location = 'global';
const client = projectId ? new GoogleGenAI({
  vertexai: true,
  project: projectId,
  location: location
}) : null;

/**
 * askGemini
 * ---------
 * The primary server action for the VoteGuide AI Civic Assistant.
 * It takes a user's question, wraps it in a protective civic-focused prompt,
 * and returns a concise, neutral answer from Gemini 1.5.
 * 
 * @param question - String containing the user's inquiry or myth.
 * @returns Promise<AIResponse>
 */
export async function askGemini(question: string): Promise<AIResponse> {
  // 1. Validation: Ensure the client is ready
  if (!client) {
    const msg = "Configuration Error: Project ID is missing.";
    errors.report(msg); // Report configuration issues to Google Cloud
    return { error: msg, answer: null };
  }

  // 2. Audit Logging: Record that an interaction has started
  const metadata = {
    resource: { type: "global" },
    severity: "INFO",
  };
  const entry = log.entry(metadata, { 
    message: "Civic Assistant: Interaction Started", 
    query: question,
    timestamp: new Date().toISOString() 
  });
  log.write(entry).catch(err => console.error("Logging failed:", err));

  try {
    /**
     * PROMPT ENGINEERING
     * ------------------
     * We constrain the model to act as a neutral, professional civic assistant.
     * This prevents hallucination and ensures the tone matches a government-grade app.
     */
    const prompt = `
      You are an expert civic assistant for VoteGuide AI. 
      Your goal is to help citizens understand the election process, voting rules, and bust myths.
      
      User Question/Myth: "${question}"
      
      Instructions:
      1. Provide a clear, concise, and neutral answer.
      2. If it's a myth, explain why it is false.
      3. If it's a procedural question, explain the steps.
      4. Use simple language.
      5. Keep the response under 150 words.
      6. Use a professional and encouraging tone.
    `;

    // 3. AI Inference: Call Gemini 2.5 Flash for the fastest response
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    if (!response || !response.text) {
      throw new Error("Invalid or empty response received from AI model.");
    }

    // 4. Success: Return the verified answer
    return {
      error: null,
      answer: response.text
    };

  } catch (error: any) {
    // 5. Error Handling & Reporting
    // Log detailed error for debugging
    console.error("AI Service Failure:", error);

    // Report the error to Google Cloud Error Reporting for alerting
    errors.report(error);

    // Log the failure to Cloud Logging for audit trails
    const errorEntry = log.entry({ severity: "ERROR" }, {
      message: "Civic Assistant: Interaction Failed",
      error: error.message,
      query: question
    });
    log.write(errorEntry).catch(console.error);

    // Provide a user-friendly error message back to the UI
    let userMessage = "The AI Assistant is currently unavailable. Please try again in a moment.";
    if (error.message?.includes("authentication") || error.message?.includes("credentials")) {
      userMessage = "AI Authentication Error. Please contact support if this persists.";
    }

    return {
      error: userMessage,
      answer: null
    };
  }
}


