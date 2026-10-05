/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForInvoiceManagerApp99",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "arzo-tailor-invoice-manager.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "arzo-tailor-invoice-manager",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "arzo-tailor-invoice-manager.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f67890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
};
export type { FirebaseUser };
