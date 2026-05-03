import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock UserContext
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => ({
    profile: null,
  }),
}));

// Mock Gemini action
const mockAskAssistant = jest.fn();
jest.mock('@/app/actions/gemini', () => ({
  askGemini: (q: string) => mockAskAssistant(q),
}));

// Mock Web Speech API
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => [],
  },
  writable: true
});

// Mock SpeechSynthesisUtterance
(window as any).SpeechSynthesisUtterance = jest.fn();

import MythsPage from '@/app/myths/page';
import { mockIndianElectionData } from '@/data/indianElections';

describe('Myths Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and intro', () => {
    render(<MythsPage />);
    expect(screen.getByText(/Myth Buster/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search myths/i)).toBeInTheDocument();
  });

  it('filters myths based on search input', async () => {
    const user = userEvent.setup();
    render(<MythsPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search myths/i);
    const firstMyth = mockIndianElectionData.myths[0].myth;
    
    // Check it's there
    expect(screen.getByText(firstMyth)).toBeInTheDocument();
    
    // Type something that doesn't match
    await user.type(searchInput, 'XYZNonExistent');
    expect(screen.queryByText(firstMyth)).not.toBeInTheDocument();
    expect(screen.getByText(/No myths found/i)).toBeInTheDocument();
  });

  it('triggers speech synthesis when Read Aloud is clicked', async () => {
    render(<MythsPage />);
    const readAloudBtn = screen.getAllByLabelText(/Read aloud/i)[0];
    
    fireEvent.click(readAloudBtn);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('handles AI Assistant submission', async () => {
    const user = userEvent.setup();
    mockAskAssistant.mockResolvedValue({ answer: "AI Answer" });
    
    render(<MythsPage />);
    const input = screen.getByPlaceholderText(/Can I vote if my name is missing/i);
    // There are multiple buttons (Read Aloud buttons + Submit button)
    // The submit button is the one inside the form
    const submitBtn = screen.getByRole('button', { name: '' }); // The one with no label but is a button
    // Actually, let's just find the button with the Send icon (which is not easily findable by name)
    // Or just the button that is NOT "Read Aloud"
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find(b => !b.getAttribute('aria-label')?.includes('Read aloud'));
    
    await user.type(input, 'How to vote?');
    await user.click(sendBtn!);
    
    expect(mockAskAssistant).toHaveBeenCalledWith('How to vote?');
    expect(await screen.findByText('AI Answer')).toBeInTheDocument();
  });
});
