"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize the new unified Google Gen AI client for Vertex AI
const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = 'global';

const client = project ? new GoogleGenAI({
  vertexai: true,
  project: project,
  location: location
}) : null;

export async function askGemini(question: string) {
  if (!client) {
    return {
      error: "Project ID is missing. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.",
      answer: null
    };
  }

  try {
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

    // In the new unified SDK, we use client.models.generateContent
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    if (!response) {
      throw new Error("No response received from AI");
    }

    const text = response.text;

    if (!text) {
      throw new Error("Empty response from AI");
    }

    return {
      error: null,
      answer: text
    };
  } catch (error: any) {
    console.error("Google Gen AI Error:", error);

    let errorMessage = "Failed to connect to the AI Assistant.";
    if (error.message?.includes("authentication") || error.message?.includes("credentials")) {
      errorMessage = "AI Authentication failed. If running locally, please run 'gcloud auth application-default login'.";
    }

    return {
      error: errorMessage,
      answer: null
    };
  }
}
