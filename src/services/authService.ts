import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { mockStore } from '../firebase/mockStore';
import type { UserProfile, UserRole } from '../types';

const LOCAL_AUTH_USER_KEY = 'focusclass_current_user_uid';

export async function loginUser(email: string, password?: string): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, email, password || 'password123');
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  }

  // Local Reactive Store fallback
  const user = mockStore.getUserByEmail(email);
  if (!user) {
    throw new Error(`No account found with email "${email}". Please register or use a demo account.`);
  }
  localStorage.setItem(LOCAL_AUTH_USER_KEY, user.uid);
  return user;
}

export async function registerUser(name: string, email: string, role: UserRole, password?: string): Promise<UserProfile> {
  const uid = 'usr-' + Math.random().toString(36).substring(2, 9);
  const profile: UserProfile = {
    uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && auth && db) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password || 'password123');
      profile.uid = cred.user.uid;
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      return profile;
    } catch (err: any) {
      console.warn('Firebase registration failed, using local store:', err);
    }
  }

  // Check if email already exists in local store
  const existing = mockStore.getUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email already exists. Please login instead.');
  }

  mockStore.upsertUser(profile);
  localStorage.setItem(LOCAL_AUTH_USER_KEY, profile.uid);
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
  }
  localStorage.removeItem(LOCAL_AUTH_USER_KEY);
}

export function getCurrentUserProfile(): UserProfile | null {
  const storedUid = localStorage.getItem(LOCAL_AUTH_USER_KEY);
  if (!storedUid) return null;
  return mockStore.getUser(storedUid);
}

export function onAuthUserChanged(callback: (user: UserProfile | null) => void): () => void {
  if (isFirebaseConfigured && auth && db) {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as UserProfile);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      // fallback check
      callback(getCurrentUserProfile());
    });
  }

  // Local Reactive Store listener
  const check = () => {
    callback(getCurrentUserProfile());
  };

  const unsubscribe = mockStore.subscribe(check);
  check();
  return unsubscribe;
}
