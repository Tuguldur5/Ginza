import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb, objectId } from "@/lib/mongodb";

export const ADMIN_SESSION_COOKIE = "ginza_admin_session";
const sessionMaxAge = 60 * 60 * 8;
const defaultUsername = "user-admin";
const defaultPassword = "ginza123";
const sessionSecret = process.env.MONGODB_URI || "ginza-session-secret";

type AdminUser = { _id: import("mongodb").ObjectId; username: string; name: string; role: "admin"; passwordHash?: string | null; isActive: boolean; createdAt: Date | string; updatedAt: Date | string };

export async function ensureDefaultAdmin() {
  const db = await getDb();
  const existing = await db.collection<AdminUser>("admin_users").findOne({ username: defaultUsername });
  if (existing && !existing.passwordHash) {
    await db.collection("admin_users").updateOne({ _id: existing._id }, { $set: { passwordHash: await bcrypt.hash(defaultPassword, 12), updatedAt: new Date() } });
  }
}

export async function createSession(userId: string) {
  const signature = crypto.createHmac("sha256", sessionSecret).update(userId).digest("hex");
  const token = `${userId}.${signature}`;
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: sessionMaxAge });
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [rawUserId, signature] = token.split(".");
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(rawUserId || "").digest("hex");
  if (!rawUserId || !signature || signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;
  const userId = objectId(rawUserId);
  if (!userId) return null;
  const user = await (await getDb()).collection<AdminUser>("admin_users").findOne({ _id: userId, isActive: true }, { projection: { passwordHash: 0 } });
  return user ? { id: user._id.toString(), username: user.username, name: user.name, role: user.role, isActive: user.isActive } : null;
}

export async function requireAdmin() { const admin = await getCurrentAdmin(); if (!admin) throw new Error("UNAUTHORIZED"); return admin; }
export async function destroySession() { (await cookies()).delete(ADMIN_SESSION_COOKIE); }
export { bcrypt, defaultPassword, defaultUsername };