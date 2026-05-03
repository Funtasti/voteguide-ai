// Set environment variables BEFORE importing the module
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

// Mock the Google Cloud libraries
const mockLogWrite = jest.fn().mockResolvedValue({});
const mockLogEntry = jest.fn().mockReturnValue({});
const mockErrorReport = jest.fn();

jest.mock('@google-cloud/logging', () => ({
  Logging: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockImplementation(() => ({
      entry: mockLogEntry,
      write: mockLogWrite,
    })),
  })),
}));

jest.mock('@google-cloud/error-reporting', () => ({
  ErrorReporting: jest.fn().mockImplementation(() => ({
    report: mockErrorReport,
  })),
}));

// Mock the Google GenAI SDK
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    }
  })),
}));

import { askGemini } from '@/app/actions/gemini';

describe('Gemini Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an answer on successful API call', async () => {
    mockGenerateContent.mockResolvedValue({
      text: "This is a helpful civic answer."
    });

    const result = await askGemini("How do I register?");
    
    expect(result.answer).toBe("This is a helpful civic answer.");
    expect(result.error).toBeNull();
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('returns an error if the API call fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    const result = await askGemini("test");
    
    expect(result.error).toContain("The AI Assistant is currently unavailable");
    expect(mockErrorReport).toHaveBeenCalled();
    expect(mockLogWrite).toHaveBeenCalled();
  });

  it('returns a specific error for authentication failures', async () => {
    mockGenerateContent.mockRejectedValue(new Error("Authentication failed"));

    const result = await askGemini("test");
    
    expect(result.error).toContain("AI Authentication Error");
  });

  it('handles empty responses gracefully', async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });

    const result = await askGemini("test");
    
    expect(result.error).toContain("The AI Assistant is currently unavailable");
  });

  it('logs an error to console if Cloud Logging fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLogWrite.mockRejectedValueOnce(new Error("Logging error"));

    await askGemini("test");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Cloud Logging failed:"), "Logging error");
    consoleSpy.mockRestore();
  });
});
