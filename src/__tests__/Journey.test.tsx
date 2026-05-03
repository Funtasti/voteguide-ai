import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock UserContext
const mockUseUserContext = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => mockUseUserContext(),
}));

// Mock Firebase services
jest.mock('@/lib/firebase/services', () => ({
  getElectionConfig: jest.fn().mockResolvedValue(null), // Fallback to mock data
}));

import Journey from '@/app/journey/page';
import { mockIndianElectionData } from '@/data/indianElections';

describe('Journey Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no profile exists', () => {
    mockUseUserContext.mockReturnValue({
      profile: null,
      isHydrated: true,
    });

    render(<Journey />);
    expect(screen.getByText(/You haven't set up your journey yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Setup/i })).toBeInTheDocument();
  });

  it('renders the timeline when a profile exists', async () => {
    mockUseUserContext.mockReturnValue({
      profile: { 
        region: 'India (National)', 
        isFirstTimeVoter: true,
        concerns: ['Registration']
      },
      isHydrated: true,
    });

    render(<Journey />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Election Journey')).toBeInTheDocument();
    });
    
    expect(screen.getByText('India (National)')).toBeInTheDocument();
    expect(screen.getByText('First-Time Voter')).toBeInTheDocument();
    // Check for some timeline item from mock data
    expect(screen.getByText(mockIndianElectionData.phases[0].title)).toBeInTheDocument();
  });

  it('contains the "Retake Questionnaire" button', async () => {
    mockUseUserContext.mockReturnValue({
      profile: { 
        region: 'India (National)', 
        isFirstTimeVoter: false,
        concerns: []
      },
      isHydrated: true,
    });

    render(<Journey />);

    await waitFor(() => {
      expect(screen.getByText(/Retake Questionnaire/i)).toBeInTheDocument();
    });
  });
});
