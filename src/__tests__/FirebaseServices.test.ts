import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';
import { 
  saveProfileToFirestore, 
  getProfileFromFirestore,
  ensureAnonymousAuth,
  getElectionConfig
} from '@/lib/firebase/services';
import { db, auth } from '@/lib/firebase/firebase';
import { User } from 'firebase/auth';

jest.mock('@/lib/firebase/firebase', () => ({
  db: { type: 'firestore' },
  auth: { type: 'auth', currentUser: null },
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn((_db, coll, id) => ({ path: `${coll}/${id}` })),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('Firebase Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as { currentUser: User | null }).currentUser = null;
  });

  describe('ensureAnonymousAuth', () => {
    it('returns current user if already signed in', async () => {
      const mockUser = { uid: 'existing-uid' } as User;
      (auth as { currentUser: User | null }).currentUser = mockUser;
      
      const user = await ensureAnonymousAuth();
      expect(user).toEqual(mockUser);
      expect(firebaseAuth.signInAnonymously).not.toHaveBeenCalled();
    });

    it('signs in anonymously if no current user', async () => {
      const mockUser = { uid: 'new-uid' } as User;
      // Mock onAuthStateChanged to call callback asynchronously so unsubscribe is defined
      (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
        setTimeout(() => callback(null), 0);
        return jest.fn();
      });
      (firebaseAuth.signInAnonymously as jest.Mock).mockResolvedValue({ user: mockUser });
      
      const user = await ensureAnonymousAuth();
      expect(user).toEqual(mockUser);
      expect(firebaseAuth.signInAnonymously).toHaveBeenCalled();
    });

    it('resolves if onAuthStateChanged returns a user', async () => {
      const mockUser = { uid: 'auth-changed-uid' } as User;
      (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });
      
      const user = await ensureAnonymousAuth();
      expect(user).toEqual(mockUser);
    });

    it('rejects if signInAnonymously fails', async () => {
      (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
        setTimeout(() => callback(null), 0);
        return jest.fn();
      });
      (firebaseAuth.signInAnonymously as jest.Mock).mockRejectedValue(new Error("Auth Error"));
      
      await expect(ensureAnonymousAuth()).rejects.toThrow("Auth Error");
    });
  });

  describe('saveProfileToFirestore', () => {
    it('calls setDoc with correct path and data', async () => {
      const profile = { region: 'India', isFirstTimeVoter: true, ageGroup: '18+', concerns: [] };
      const uid = 'test-uid';
      
      await saveProfileToFirestore(uid, profile);
      
      expect(firebaseFirestore.doc).toHaveBeenCalledWith(db, 'users', uid);
      expect(firebaseFirestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'users/test-uid' }), 
        expect.objectContaining(profile), 
        { merge: true }
      );
    });
  });

  describe('getProfileFromFirestore', () => {
    it('returns profile if document exists', async () => {
      const mockProfileData = { region: 'India' };
      (firebaseFirestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockProfileData
      });
      
      const profile = await getProfileFromFirestore('test-uid');
      expect(profile).toEqual(mockProfileData);
    });

    it('returns null if document does not exist', async () => {
      (firebaseFirestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      });
      
      const profile = await getProfileFromFirestore('test-uid');
      expect(profile).toBeNull();
    });
  });

  describe('getElectionConfig', () => {
    it('returns config if region matches', async () => {
      const mockConfig = { region: 'Maharashtra', phases: [] };
      (firebaseFirestore.getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockConfig }]
      });
      
      const config = await getElectionConfig('Maharashtra');
      expect(config).toEqual(mockConfig);
    });

    it('returns null if no config found', async () => {
      (firebaseFirestore.getDocs as jest.Mock).mockResolvedValue({ empty: true });
      const config = await getElectionConfig('Unknown');
      expect(config).toBeNull();
    });

    it('handles query errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (firebaseFirestore.getDocs as jest.Mock).mockRejectedValue(new Error("Firestore Fail"));
      
      const config = await getElectionConfig('Fail');
      expect(config).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
