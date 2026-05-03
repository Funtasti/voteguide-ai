import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';

jest.mock('@/lib/firebase/firebase', () => ({
  db: { type: 'firestore' },
  auth: { type: 'auth', currentUser: null },
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn((db, coll, id) => ({ path: `${coll}/${id}` })),
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

import { 
  saveProfileToFirestore, 
  getProfileFromFirestore,
  ensureAnonymousAuth 
} from '@/lib/firebase/services';
import { db, auth } from '@/lib/firebase/firebase';

describe('Firebase Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = null;
  });

  describe('ensureAnonymousAuth', () => {
    it('returns current user if already signed in', async () => {
      const mockUser = { uid: 'existing-uid' };
      (auth as any).currentUser = mockUser;
      
      const user = await ensureAnonymousAuth();
      expect(user).toEqual(mockUser);
      expect(firebaseAuth.signInAnonymously).not.toHaveBeenCalled();
    });

    it('signs in anonymously if no current user', async () => {
      const mockUser = { uid: 'new-uid' };
      // Mock onAuthStateChanged to call callback asynchronously so unsubscribe is defined
      (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(null), 0);
        return jest.fn();
      });
      (firebaseAuth.signInAnonymously as jest.Mock).mockResolvedValue({ user: mockUser });
      
      const user = await ensureAnonymousAuth();
      expect(user).toEqual(mockUser);
      expect(firebaseAuth.signInAnonymously).toHaveBeenCalled();
    });
  });

  describe('saveProfileToFirestore', () => {
    it('calls setDoc with correct path and data', async () => {
      const profile = { region: 'India', isFirstTimeVoter: true, ageGroup: '18+', concerns: [] };
      const uid = 'test-uid';
      
      await saveProfileToFirestore(uid, profile as any);
      
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
});
