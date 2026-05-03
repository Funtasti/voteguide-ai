import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { UserProvider, useUserContext, VoterProfile } from '@/context/UserContext';
import * as firebaseServices from '@/lib/firebase/services';

// Mock Firebase services
jest.mock('@/lib/firebase/services', () => ({
  ensureAnonymousAuth: jest.fn(),
  saveProfileToFirestore: jest.fn(),
  getProfileFromFirestore: jest.fn(),
}));

// Helper component to consume context in tests
const TestConsumer = ({ onContext }: { onContext: (ctx: any) => void }) => {
  const context = useUserContext();
  onContext(context);
  return null;
};

describe('UserContext', () => {
  let capturedContext: any;
  const setCapturedContext = (ctx: any) => { capturedContext = ctx; };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    capturedContext = null;
    
    // Default mocks
    (firebaseServices.ensureAnonymousAuth as jest.Mock).mockResolvedValue({ uid: 'test-uid' });
    (firebaseServices.getProfileFromFirestore as jest.Mock).mockResolvedValue(null);
  });

  it('initializes with null profile if nothing is stored', async () => {
    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContext={setCapturedContext} />
        </UserProvider>
      );
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));
    expect(capturedContext.profile).toBeNull();
  });

  it('loads profile from localStorage if cloud profile is missing', async () => {
    const mockProfile: VoterProfile = {
      region: 'India (National)',
      isFirstTimeVoter: true,
      ageGroup: '18+',
      concerns: ['Docs']
    };
    localStorage.setItem('voteGuideProfile', JSON.stringify(mockProfile));

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContext={setCapturedContext} />
        </UserProvider>
      );
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));
    expect(capturedContext.profile).toEqual(mockProfile);
    expect(firebaseServices.saveProfileToFirestore).toHaveBeenCalledWith('test-uid', mockProfile);
  });

  it('prioritizes cloud profile over localStorage', async () => {
    const cloudProfile: VoterProfile = {
      region: 'Cloud Region',
      isFirstTimeVoter: false,
      ageGroup: '18+',
      concerns: []
    };
    const localProfile = { region: 'Local Region' };
    localStorage.setItem('voteGuideProfile', JSON.stringify(localProfile));
    
    (firebaseServices.getProfileFromFirestore as jest.Mock).mockResolvedValue(cloudProfile);

    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContext={setCapturedContext} />
        </UserProvider>
      );
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));
    expect(capturedContext.profile).toEqual(cloudProfile);
    expect(JSON.parse(localStorage.getItem('voteGuideProfile')!)).toEqual(cloudProfile);
  });

  it('saveProfile updates state, localStorage and cloud', async () => {
    await act(async () => {
      render(
        <UserProvider>
          <TestConsumer onContext={setCapturedContext} />
        </UserProvider>
      );
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));

    const newProfile: VoterProfile = {
      region: 'New Region',
      isFirstTimeVoter: true,
      ageGroup: '18+',
      concerns: ['Test']
    };

    await act(async () => {
      await capturedContext.saveProfile(newProfile);
    });

    expect(capturedContext.profile).toEqual(newProfile);
    expect(JSON.parse(localStorage.getItem('voteGuideProfile')!)).toEqual(newProfile);
    expect(firebaseServices.saveProfileToFirestore).toHaveBeenCalledWith('test-uid', newProfile);
  });
});
