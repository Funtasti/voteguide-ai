import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock the UserContext
const mockSaveProfile = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => ({
    profile: null,
    saveProfile: mockSaveProfile,
    clearProfile: jest.fn(),
    isHydrated: true,
  }),
}));

import Onboarding from '@/app/onboarding/page';

/**
 * Onboarding uses a 300 ms setTimeout to auto-advance on single-choice steps.
 * We configure userEvent to call jest.advanceTimersByTime so fake timers
 * cooperate with the async userEvent API (required for @testing-library/user-event v14+).
 */
function setup() {
  jest.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: (ms) => jest.advanceTimersByTime(ms) });
  return { user };
}

describe('Onboarding page', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders the first question on mount', () => {
    setup();
    render(<Onboarding />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Where do you vote/i)).toBeInTheDocument();
  });

  it('shows the progress bar with correct aria-label', () => {
    setup();
    render(<Onboarding />);
    expect(screen.getByLabelText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it('auto-advances to step 2 after selecting a region', async () => {
    const { user } = setup();
    render(<Onboarding />);
    await user.click(screen.getByText('India (National)'));
    // Advance past the 300 ms auto-advance timer
    act(() => { jest.advanceTimersByTime(300); });
    expect(screen.getByText(/Are you a first-time voter/i)).toBeInTheDocument();
  });

  it('Next button is disabled on the concerns step when nothing is selected', async () => {
    const { user } = setup();
    render(<Onboarding />);
    // Step 1
    await user.click(screen.getByText('India (National)'));
    act(() => { jest.advanceTimersByTime(300); });
    // Step 2
    await user.click(screen.getByText(/Yes, this is my first time/i));
    act(() => { jest.advanceTimersByTime(300); });
    // Step 3 — multi-select, nothing chosen yet
    const nextBtn = screen.getByRole('button', { name: /see my journey/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Next button enables after selecting at least one concern', async () => {
    const { user } = setup();
    render(<Onboarding />);
    await user.click(screen.getByText('India (National)'));
    act(() => { jest.advanceTimersByTime(300); });
    await user.click(screen.getByText(/Yes, this is my first time/i));
    act(() => { jest.advanceTimersByTime(300); });
    await user.click(screen.getByText(/Registering to vote/i));
    const nextBtn = screen.getByRole('button', { name: /see my journey/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('can deselect a concern on the multi-select step', async () => {
    const { user } = setup();
    render(<Onboarding />);
    await user.click(screen.getByText('India (National)'));
    act(() => { jest.advanceTimersByTime(300); });
    await user.click(screen.getByText(/Yes, this is my first time/i));
    act(() => { jest.advanceTimersByTime(300); });
    // Select then deselect
    await user.click(screen.getByText(/Registering to vote/i));
    await user.click(screen.getByText(/Registering to vote/i));
    const nextBtn = screen.getByRole('button', { name: /see my journey/i });
    expect(nextBtn).toBeDisabled();
  });
});
