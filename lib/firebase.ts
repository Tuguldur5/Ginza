import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") throw new Error("Firebase Auth must be used in the browser.");
  return getAuth(firebaseApp);
}

export function createPhoneRecaptcha(containerId: string) {
  const auth = getFirebaseAuth();
  const existing = (window as Window & { ginzaRecaptcha?: RecaptchaVerifier }).ginzaRecaptcha;
  if (existing) return existing;
  const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  (window as Window & { ginzaRecaptcha?: RecaptchaVerifier }).ginzaRecaptcha = verifier;
  return verifier;
}
