import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock UserContext
const mockUseUserContext = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => mockUseUserContext(),
}));

import { Header } from '@/components/layout/Header';

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "My Journey" linking to /onboarding when no profile exists', () => {
    mockUseUserContext.mockReturnValue({
      profile: null,
      user: null,
      isSyncing: false,
    });

    render(<Header />);
    const link = screen.getByText('My Journey');
    expect(link.closest('a')).toHaveAttribute('href', '/onboarding');
  });

  it('renders "My Journey" linking to /journey when a profile exists', () => {
    mockUseUserContext.mockReturnValue({
      profile: { region: 'India' },
      user: { uid: '123' },
      isSyncing: false,
    });

    render(<Header />);
    const link = screen.getByText('My Journey');
    expect(link.closest('a')).toHaveAttribute('href', '/journey');
  });

  it('shows syncing status when isSyncing is true', () => {
    mockUseUserContext.mockReturnValue({
      profile: { region: 'India' },
      user: { uid: '123' },
      isSyncing: true,
    });

    render(<Header />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('shows synced status when profile is present and not syncing', () => {
    mockUseUserContext.mockReturnValue({
      profile: { region: 'India' },
      user: { uid: '123' },
      isSyncing: false,
    });

    render(<Header />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('shows Local status when user is present but no profile yet', () => {
    mockUseUserContext.mockReturnValue({
      profile: null,
      user: { uid: '123' },
      isSyncing: false,
    });

    render(<Header />);
    expect(screen.getByText('Local')).toBeInTheDocument();
  });
});
