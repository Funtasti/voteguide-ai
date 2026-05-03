"use server";

import { GoogleGenAI } from "@google/genai";
import { Logging } from "@google-cloud/logging";
import { ErrorReporting } from "@google-cloud/error-reporting";

/**
 * PRODUCTION-GRADE OBSERVABILITY SETUP
 * -----------------------------------
 * We use Google Cloud Logging for request tracking and Error Reporting 
 * to automatically capture and notify us of any server-side failures.
 * 
 * PROJECT_ID is required for these services to route data to the correct dashboard.
 */
const projectId: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

/**
 * GOOGLE CLOUD LOGGING INITIALIZATION
 * Used for audit trails and usage analytics.
 */
const logging: Logging = new Logging({ projectId });
const log = logging.log("ai-assistant-logs");

/**
 * GOOGLE CLOUD ERROR REPORTING INITIALIZATION
 * Automatically captures stack traces and notifies the team of crashes.
 */
const errors: ErrorReporting = new ErrorReporting({ projectId });

/**
 * Type definition for the AI Assistant's standard response.
 * Standardizing this ensures the frontend can reliably handle all states.
 */
export interface AIResponse {
  error: string | null;
  answer: string | null;
}

/**
 * AI CLIENT INITIALIZATION (VERTEX AI)
 * ------------------------------------
 * We use the unified Google Gen AI SDK in Vertex AI mode.
 * This is the most secure method for Cloud Run as it uses the Service Account's 
 * identity instead of static API keys.
 */
const location: string = 'global';
const client: GoogleGenAI | null = projectId ? new GoogleGenAI({
  vertexai: true,
  project: projectId,
  location: location
}) : null;

/**
 * askGemini
 * ---------
 * The primary server action for the VoteGuide AI Civic Assistant.
 * 
 * @param question - String containing the user's inquiry or myth.
 * @returns Promise<AIResponse> - A structured response with either the answer or an error message.
 */
export async function askGemini(question: string): Promise<AIResponse> {
  // 0. Security: Sanitize input to prevent prompt injection or abuse
  // Limit length and remove potential control characters
  const sanitizedQuestion = question.trim().substring(0, 500).replace(/[^\w\s\?\.\!\,\-]/gi, '');

  if (!sanitizedQuestion) {
    return { error: "Please enter a valid question.", answer: null };
  }

  // 1. Validation: Ensure the Google Gen AI client is initialized correctly
  if (!client) {
    const msg: string = "Configuration Error: Project ID is missing.";
    errors.report(msg); 
    return { error: msg, answer: null };
  }

  /**
   * AUDIT LOG ENTRY
   */
  const metadata = {
    resource: { type: "global" },
    severity: "INFO" as const,
  };
  const entry = log.entry(metadata, { 
    message: "Civic Assistant: Interaction Started", 
    query: sanitizedQuestion,
    timestamp: new Date().toISOString() 
  });
  
  // Asynchronous write
  log.write(entry).catch((err: Error) => console.error("Cloud Logging failed:", err.message));

  try {
    const prompt: string = `
      You are an expert civic assistant for VoteGuide AI. 
      Your goal is to help citizens understand the election process, voting rules, and bust myths.
      
      User Question/Myth: "${sanitizedQuestion}"
      
      Instructions:
      1. Provide a clear, concise, and neutral answer.
      2. If it's a myth, explain why it is false.
      3. If it's a procedural question, explain the steps.
      4. Use simple language.
      5. Keep the response under 150 words.
      6. Use a professional and encouraging tone.
    `;

    /**
     * AI INFERENCE
     * Calling Gemini 2.5 Flash for the optimal balance of speed and intelligence.
     */
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    // Validate the response structure before accessing text
    if (!response || !response.text) {
      throw new Error("Invalid or empty response received from AI model.");
    }

    // 4. Success Path: Return the verified answer to the client
    return {
      error: null,
      answer: response.text
    };

  } catch (error: unknown) {
    /**
     * ERROR HANDLING & OBSERVABILITY
     * ------------------------------
     * We convert unknown errors into a standard format and report them 
     * to Google Cloud Error Reporting for alerting.
     */
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Server-side console log for quick debugging
    console.error("AI Service Failure:", err.message);

    // Report the error to Google Cloud Error Reporting
    errors.report(err);

    // Audit log the failure
    const errorEntry = log.entry({ severity: "ERROR" as const }, {
      message: "Civic Assistant: Interaction Failed",
      error: err.message,
      query: question
    });
    log.write(errorEntry).catch((logErr: Error) => console.error("Error logging failure:", logErr.message));

    // Provide a user-friendly error message back to the UI
    let userMessage: string = "The AI Assistant is currently unavailable. Please try again in a moment.";
    if (err.message.toLowerCase().includes("authentication") || err.message.toLowerCase().includes("credentials")) {
      userMessage = "AI Authentication Error. Please contact support if this persists.";
    }

    return {
      error: userMessage,
      answer: null
    };
  }
}



