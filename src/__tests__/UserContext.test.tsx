import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { UserProvider, useUserContext, VoterProfile } from '@/context/UserContext';
import * as firebaseServices from '@/lib/firebase/services';
import { User } from 'firebase/auth';

// Mock Firebase services
jest.mock('@/lib/firebase/services', () => ({
  ensureAnonymousAuth: jest.fn(),
  saveProfileToFirestore: jest.fn(),
  getProfileFromFirestore: jest.fn(),
}));

// Helper component to consume context in tests
const TestConsumer = ({ onContext }: { onContext: (ctx: ReturnType<typeof useUserContext>) => void }) => {
  const context = useUserContext();
  onContext(context);
  return null;
};

describe('UserContext', () => {
  let capturedContext: ReturnType<typeof useUserContext>;
  const setCapturedContext = (ctx: ReturnType<typeof useUserContext>) => { capturedContext = ctx; };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mocks
    (firebaseServices.ensureAnonymousAuth as jest.Mock).mockResolvedValue({ uid: 'test-uid' } as User);
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

  it('clearProfile resets profile and localStorage', async () => {
    await act(async () => {
      render(<UserProvider><TestConsumer onContext={setCapturedContext} /></UserProvider>);
    });

    await act(async () => {
      capturedContext.clearProfile();
    });

    expect(capturedContext.profile).toBeNull();
    expect(localStorage.getItem('voteGuideProfile')).toBeNull();
  });

  it('handles initialization errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (firebaseServices.ensureAnonymousAuth as jest.Mock).mockRejectedValue(new Error("Auth Fail"));

    await act(async () => {
      render(<UserProvider><TestConsumer onContext={setCapturedContext} /></UserProvider>);
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("User Context Initialization Error"), expect.anything());
    consoleSpy.mockRestore();
  });

  it('handles saveProfile errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (firebaseServices.saveProfileToFirestore as jest.Mock).mockRejectedValue(new Error("Cloud Sync Fail"));

    await act(async () => {
      render(<UserProvider><TestConsumer onContext={setCapturedContext} /></UserProvider>);
    });

    const newProfile: VoterProfile = { region: 'Error Region', isFirstTimeVoter: true, ageGroup: '18+', concerns: [] };
    
    await act(async () => {
      await capturedContext.saveProfile(newProfile);
    });

    expect(capturedContext.profile).toEqual(newProfile); // Should still update locally
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('throws error when used outside of UserProvider', () => {
    // Suppress console.error for this expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestConsumer onContext={() => {}} />);
    }).toThrow("useUserContext must be used within a UserProvider");
    
    consoleSpy.mockRestore();
  });

  it('skips cloud sync if user is not available during saveProfile', async () => {
    (firebaseServices.ensureAnonymousAuth as jest.Mock).mockResolvedValue(null);
    
    await act(async () => {
      render(<UserProvider><TestConsumer onContext={setCapturedContext} /></UserProvider>);
    });

    await waitFor(() => expect(capturedContext.isHydrated).toBe(true));

    const newProfile: VoterProfile = { region: 'Local Only', isFirstTimeVoter: true, ageGroup: '18+', concerns: [] };
    
    await act(async () => {
      await capturedContext.saveProfile(newProfile);
    });

    expect(capturedContext.profile).toEqual(newProfile);
    expect(firebaseServices.saveProfileToFirestore).not.toHaveBeenCalled();
  });
});
