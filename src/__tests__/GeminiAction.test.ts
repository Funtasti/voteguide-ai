// Set environment variables BEFORE importing the module
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

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
    
    expect(result.error).toContain("Failed to connect to the AI Assistant");
  });
});
