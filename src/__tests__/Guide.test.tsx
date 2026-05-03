import React from 'react';
import { render, screen } from '@testing-library/react';
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

import GuidePage from '@/app/guide/page';

describe('Guide Page', () => {
  it('renders the initial overview', () => {
    render(<GuidePage />);
    expect(screen.getByText(/What happens next/i)).toBeInTheDocument();
    expect(screen.getByText(/I just turned 18/i)).toBeInTheDocument();
  });

  it('switches scenarios when a card is clicked', async () => {
    const user = userEvent.setup();
    render(<GuidePage />);
    
    // Click "I have voted before" card
    const returningCard = screen.getByText(/I have voted before/i).closest('button');
    await user.click(returningCard!);
    
    // First step of returning path
    expect(screen.getAllByText(/Verify your details are correct/i).length).toBeGreaterThan(0);
  });

  it('switches to "Missed Deadline" scenario', async () => {
    const user = userEvent.setup();
    render(<GuidePage />);
    
    const missedCard = screen.getByText(/I missed a deadline/i).closest('button');
    await user.click(missedCard!);
    
    // First step of missed deadline path
    expect(screen.getAllByText(/check if your name is already registered/i).length).toBeGreaterThan(0);
  });

  it('renders VotingProcess when a voting-related step is active', async () => {
    const user = userEvent.setup();
    render(<GuidePage />);
    
    // Select first time scenario
    const firstTimeCard = screen.getByText(/I just turned 18/i).closest('button');
    await user.click(firstTimeCard!);

    // Now Step 5 is visible in nav
    const step5Nav = screen.getByText(/Vote on polling day/i);
    await user.click(step5Nav);
    
    expect(screen.getAllByText(/Booth Flow: A Visual Guide/i).length).toBeGreaterThan(0);
  });
});
