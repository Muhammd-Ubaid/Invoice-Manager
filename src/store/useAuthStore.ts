import { create } from 'zustand';
import { User } from '../types';

const INITIAL_USERS_KEY = 'invoice_manager_registered_users';
const ACTIVE_USER_KEY = 'invoice_manager_active_user';

const DEMO_USERS: User[] = [
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
      return JSON.parse(saved);
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
  
  signUp: (data: { name: string; username: string; email: string; password: string }) => { success: boolean; error?: string };
  verifyEmail: (email?: string) => void;
  sendPasswordResetEmail: (email: string) => { success: boolean; error?: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  login: (usernameOrEmail: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  signUp: ({ name, username, email, password }) => {
    const { registeredUsers } = get();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existingEmail = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existingEmail) {
      const err = 'An account with this email address already exists.';
      set({ authError: err });
      return { success: false, error: err };
    }

    const existingUsername = registeredUsers.find(
      (u) => u.username && u.username.toLowerCase() === normalizedUsername
    );
    if (existingUsername) {
      const err = 'This username is already taken. Please choose another.';
      set({ authError: err });
      return { success: false, error: err };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      email: normalizedEmail,
      username: normalizedUsername,
      displayName: name.trim() || normalizedUsername,
      password: password,
      isEmailVerified: false,
      isLoggedIn: false
    };

    const updatedUsers = [...registeredUsers, newUser];
    localStorage.setItem(INITIAL_USERS_KEY, JSON.stringify(updatedUsers));

    set({
      registeredUsers: updatedUsers,
      pendingVerificationEmail: normalizedEmail,
      authMode: 'verify',
      authError: null,
      verificationNotice: `A verification email has been sent to ${normalizedEmail}. Please check your inbox and confirm your email address.`
    });

    return { success: true };
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

  sendPasswordResetEmail: (email: string) => {
    const { registeredUsers } = get();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        (u.username && u.username.toLowerCase() === normalizedEmail) ||
        (u.displayName && u.displayName.toLowerCase() === normalizedEmail)
    );

    if (!existingUser) {
      const err = 'No registered account found with that email or username.';
      set({ authError: err });
      return { success: false, error: err };
    }

    set({
      pendingResetEmail: existingUser.email,
      authMode: 'reset',
      authError: null,
      verificationNotice: `Password reset email sent to ${existingUser.email}. Please set a new password below.`
    });

    return { success: true };
  },

  resetPassword: (targetEmail: string, newPassword: string) => {
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

  login: (usernameOrEmail: string, password?: string) => {
    const { registeredUsers } = get();
    const query = usernameOrEmail.trim().toLowerCase();

    // Look for matching user by email, username, or full display name
    let found = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.username && u.username.toLowerCase() === query) ||
        (u.displayName && u.displayName.toLowerCase() === query)
    );

    // Demo fallback for instant login button if no matching registered user
    if (!found && (!password || query === 'alex@luminastudio.dev' || query === 'owner@mybusiness.com')) {
      found = DEMO_USERS.find((u) => u.email.toLowerCase() === query || u.username === query) || DEMO_USERS[0];
    }

    if (!found) {
      const err = 'No account found matching that username or email address.';
      set({ authError: err });
      return { success: false, error: err };
    }

    // Verify password if provided
    if (password && found.password && found.password !== password) {
      const err = 'Incorrect password. Please try again.';
      set({ authError: err });
      return { success: false, error: err };
    }

    // Verify email status
    if (found.isEmailVerified === false) {
      set({
        pendingVerificationEmail: found.email,
        authMode: 'verify',
        authError: null,
        verificationNotice: `Your email address (${found.email}) has not been verified yet. Please click the button below to verify.`
      });
      return {
        success: false,
        error: 'Please verify your email address before signing in.'
      };
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
    localStorage.removeItem(ACTIVE_USER_KEY);
    set({
      user: null,
      authMode: 'login',
      verificationNotice: null,
      authError: null
    });
  }
}));
