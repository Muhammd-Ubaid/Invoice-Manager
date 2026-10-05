import { create } from 'zustand';
import { User } from '../types';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  doc, 
  setDoc, 
  getDoc 
} from '../firebase';

const INITIAL_USERS_KEY = 'invoice_manager_registered_users';
const ACTIVE_USER_KEY = 'invoice_manager_active_user';

const DEMO_USERS: User[] = [
  {
    id: 'user-arzo-admin',
    email: 'arzotailor@gmail.com',
    username: 'arzotailor',
    displayName: 'Arzo Tailor',
    password: 'Arzo123',
    isEmailVerified: true,
    isLoggedIn: false,
  },
  {
    id: 'user-01',
    email: 'owner@mybusiness.com',
    username: 'owner',
    displayName: 'Business Owner',
    password: 'password123',
    isEmailVerified: true,
    isLoggedIn: false,
  },
  {
    id: 'user-02',
    email: 'alex@luminastudio.dev',
    username: 'alex',
    displayName: 'Alex Morgan',
    password: 'password123',
    isEmailVerified: true,
    isLoggedIn: false,
  }
];

const loadRegisteredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem(INITIAL_USERS_KEY);
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      const hasArzo = parsed.some(
        (u) =>
          (u.username && u.username.toLowerCase() === 'arzotailor') ||
          u.email.toLowerCase() === 'arzotailor@gmail.com' ||
          (u.displayName && u.displayName.toLowerCase() === 'arzo tailor')
      );
      if (!hasArzo) {
        parsed.unshift(DEMO_USERS[0]);
        localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load registered users', e);
  }
  localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
};

const loadActiveUser = (): User | null => {
  try {
    const saved = localStorage.getItem(ACTIVE_USER_KEY);
    if (saved) {
      const user = JSON.parse(saved);
      if (user && user.isLoggedIn) {
        return user;
      }
    }
  } catch (e) {
    console.error('Failed to load active user', e);
  }
  return null;
};

interface AuthState {
  user: User | null;
  registeredUsers: User[];
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup' | 'verify' | 'forgot' | 'reset';
  pendingVerificationEmail: string | null;
  pendingResetEmail: string | null;
  verificationNotice: string | null;
  authError: string | null;
  
  openAuthModal: (mode?: 'login' | 'signup' | 'verify' | 'forgot' | 'reset') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'signup' | 'verify' | 'forgot' | 'reset') => void;
  clearAuthError: () => void;
  clearVerificationNotice: () => void;
  
  signUp: (data: { name: string; username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email?: string) => void;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  login: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Setup Firebase Auth State Listener
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        let userData: User;
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          userData = {
            id: fbUser.uid,
            email: fbUser.email || data.email || '',
            username: data.username || (fbUser.email ? fbUser.email.split('@')[0] : ''),
            displayName: data.displayName || fbUser.displayName || fbUser.email || 'User',
            isEmailVerified: fbUser.emailVerified || data.isEmailVerified || true,
            isLoggedIn: true
          };
        } else {
          userData = {
            id: fbUser.uid,
            email: fbUser.email || '',
            username: fbUser.email ? fbUser.email.split('@')[0] : '',
            displayName: fbUser.displayName || fbUser.email || 'User',
            isEmailVerified: fbUser.emailVerified,
            isLoggedIn: true
          };
        }

        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData));
        set({ user: userData, authError: null });
      } catch (err) {
        console.warn('Firestore user fetch note:', err);
      }
    }
  });

  return {
    user: loadActiveUser(),
    registeredUsers: loadRegisteredUsers(),
    isAuthModalOpen: false,
    authMode: 'login',
    pendingVerificationEmail: null,
    pendingResetEmail: null,
    verificationNotice: null,
    authError: null,

    openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authMode: mode, authError: null }),
    closeAuthModal: () => set({ isAuthModalOpen: false, authError: null }),
    setAuthMode: (mode) => set({ authMode: mode, authError: null }),
    clearAuthError: () => set({ authError: null }),
    clearVerificationNotice: () => set({ verificationNotice: null }),

    signUp: async ({ name, username, email, password }) => {
      const { registeredUsers } = get();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim().toLowerCase();

      // Check local list first
      const existingEmail = registeredUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (existingEmail) {
        const err = 'An account with this email address already exists.';
        set({ authError: err });
        return { success: false, error: err };
      }

      try {
        // Firebase Auth Create User
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUid = cred.user.uid;

        const newUser: User = {
          id: fbUid,
          email: normalizedEmail,
          username: normalizedUsername,
          displayName: name.trim() || normalizedUsername,
          isEmailVerified: true,
          isLoggedIn: true
        };

        // Save to Firestore
        try {
          await setDoc(doc(db, 'users', fbUid), {
            id: fbUid,
            email: normalizedEmail,
            username: normalizedUsername,
            displayName: newUser.displayName,
            createdAt: new Date().toISOString()
          });
        } catch (fsErr) {
          console.warn('Firestore user save note:', fsErr);
        }

        const updatedUsers = [...registeredUsers, newUser];
        localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));

        set({
          user: newUser,
          registeredUsers: updatedUsers,
          isAuthModalOpen: false,
          authError: null,
          verificationNotice: `Account created successfully for ${normalizedEmail}!`
        });

        return { success: true };
      } catch (fbErr: any) {
        // Fallback to local sign-up if offline or demo mode
        const newUser: User = {
          id: 'user-' + Date.now(),
          email: normalizedEmail,
          username: normalizedUsername,
          displayName: name.trim() || normalizedUsername,
          password: password,
          isEmailVerified: true,
          isLoggedIn: true
        };

        const updatedUsers = [...registeredUsers, newUser];
        localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));

        set({
          user: newUser,
          registeredUsers: updatedUsers,
          isAuthModalOpen: false,
          authError: null,
          verificationNotice: `Account created successfully for ${normalizedEmail}!`
        });

        return { success: true };
      }
    },

    verifyEmail: (targetEmail?: string) => {
      const { pendingVerificationEmail, registeredUsers } = get();
      const emailToVerify = (targetEmail || pendingVerificationEmail || '').toLowerCase();

      if (!emailToVerify) return;

      const updatedUsers = registeredUsers.map((u) => {
        if (u.email.toLowerCase() === emailToVerify) {
          return { ...u, isEmailVerified: true };
        }
        return u;
      });

      localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(updatedUsers));

      set({
        registeredUsers: updatedUsers,
        pendingVerificationEmail: null,
        authMode: 'login',
        authError: null,
        verificationNotice: `Email ${emailToVerify} verified successfully! You can now sign in with your credentials.`
      });
    },

    sendPasswordResetEmail: async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      try {
        await firebaseSendPasswordResetEmail(auth, normalizedEmail);
        set({
          authMode: 'login',
          authError: null,
          verificationNotice: `Password reset email sent to ${normalizedEmail}. Please check your inbox.`
        });
        return { success: true };
      } catch (e) {
        set({
          pendingResetEmail: normalizedEmail,
          authMode: 'reset',
          authError: null,
          verificationNotice: `Please enter your new password below for ${normalizedEmail}.`
        });
        return { success: true };
      }
    },

    resetPassword: async (targetEmail: string, newPassword: string) => {
      const { registeredUsers } = get();
      const normalizedEmail = targetEmail.trim().toLowerCase();

      const updatedUsers = registeredUsers.map((u) => {
        if (u.email.toLowerCase() === normalizedEmail) {
          return { ...u, password: newPassword, isEmailVerified: true };
        }
        return u;
      });

      localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(updatedUsers));

      set({
        registeredUsers: updatedUsers,
        pendingResetEmail: null,
        authMode: 'login',
        authError: null,
        verificationNotice: 'Password updated successfully! Please sign in with your new password.'
      });

      return { success: true };
    },

    login: async (usernameOrEmail: string, password?: string) => {
      const { registeredUsers } = get();
      const query = usernameOrEmail.trim().toLowerCase();

      // Try Firebase Login if password provided
      if (password) {
        try {
          const cred = await signInWithEmailAndPassword(auth, query, password);
          const fbUser = cred.user;

          const activeUser: User = {
            id: fbUser.uid,
            email: fbUser.email || query,
            username: query.includes('@') ? query.split('@')[0] : query,
            displayName: fbUser.displayName || query,
            isEmailVerified: true,
            isLoggedIn: true
          };

          localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));

          set({
            user: activeUser,
            isAuthModalOpen: false,
            authError: null,
            verificationNotice: null
          });

          return { success: true };
        } catch (fbErr: any) {
          console.warn('Firebase login attempt fallback:', fbErr.message);
        }
      }

      // Local / Demo Fallback
      let found = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === query ||
          (u.username && u.username.toLowerCase() === query) ||
          (u.displayName && u.displayName.toLowerCase() === query)
      );

      if (!found && (!password || query === 'alex@luminastudio.dev' || query === 'owner@mybusiness.com' || query === 'arzotailor' || query === 'arzo tailor' || query === 'arzotailor@gmail.com')) {
        found = DEMO_USERS.find((u) => u.email.toLowerCase() === query || (u.username && u.username.toLowerCase() === query) || (u.displayName && u.displayName.toLowerCase() === query)) || DEMO_USERS[0];
      }

      if (!found) {
        const err = 'No account found matching that username or email address.';
        set({ authError: err });
        return { success: false, error: err };
      }

      if (password && found.password && found.password !== password) {
        const err = 'Incorrect password. Please try again.';
        set({ authError: err });
        return { success: false, error: err };
      }

      const activeUser: User = {
        ...found,
        isLoggedIn: true
      };

      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));

      set({
        user: activeUser,
        isAuthModalOpen: false,
        authError: null,
        verificationNotice: null
      });

      return { success: true };
    },

    logout: () => {
      try {
        firebaseSignOut(auth);
      } catch (e) {}
      localStorage.removeItem(ACTIVE_USER_KEY);
      set({
        user: null,
        authMode: 'login',
        verificationNotice: null,
        authError: null
      });
    }
  };
});
