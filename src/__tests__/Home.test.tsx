import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock UserContext
const mockUseUserContext = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => mockUseUserContext(),
}));

import Home from '@/app/page';

describe('Home Page', () => {
  it('renders hero section with Get Started when no profile exists', () => {
    mockUseUserContext.mockReturnValue({
      profile: null,
      isHydrated: true,
    });

    render(<Home />);
    expect(screen.getByText(/Navigate the election process with/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('renders View My Journey when profile exists', () => {
    mockUseUserContext.mockReturnValue({
      profile: { region: 'India' },
      isHydrated: true,
    });

    render(<Home />);
    expect(screen.getByRole('button', { name: /View My Journey/i })).toBeInTheDocument();
  });

  it('renders features section', () => {
    mockUseUserContext.mockReturnValue({
      profile: null,
      isHydrated: true,
    });

    render(<Home />);
    expect(screen.getByText(/Personalized Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Fight Misinformation/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear & Accessible/i)).toBeInTheDocument();
  });
});
