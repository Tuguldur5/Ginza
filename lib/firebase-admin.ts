import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const serviceAccount = JSON.parse(raw) as { project_id: string; client_email: string; private_key: string };
    return initializeApp({ credential: cert({ ...serviceAccount, privateKey: serviceAccount.private_key.replace(/\\n/g, "\n") }) });
  }
  return initializeApp();
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
