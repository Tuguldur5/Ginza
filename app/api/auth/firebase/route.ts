import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { createUserSession } from "@/lib/auth";
import { getDb, serialize } from "@/lib/mongodb";

const mongolianPhone = /^\+976\d{8}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = typeof body.idToken === "string" ? body.idToken : "";
    if (!idToken) return NextResponse.json({ error: "Firebase token шаардлагатай." }, { status: 400 });
    const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const phone = decoded.phone_number || "";
    if (!mongolianPhone.test(phone)) return NextResponse.json({ error: "Монгол утасны дугаар шаардлагатай." }, { status: 400 });
    const normalizedPhone = phone.slice(4);
    const db = await getDb();
    const admin = await db.collection("admin_users").findOne({ phone: normalizedPhone, role: "admin", isActive: true });
    const role = admin ? "admin" : "user";
    const user = admin || await db.collection("loyalty_users").findOneAndUpdate({ phone: normalizedPhone }, { $set: { firebaseUid: decoded.uid, updatedAt: new Date() }, $setOnInsert: { phone: normalizedPhone, name: decoded.name || "", stamps: 0, coupons: 0, role: "USER", isActive: true, createdAt: new Date() } }, { upsert: true, returnDocument: "after" });
    if (!user?._id) return NextResponse.json({ error: "Хэрэглэгч үүсгэхэд алдаа гарлаа." }, { status: 500 });
    await createUserSession({ id: user._id.toString(), phone: normalizedPhone, role });
    return NextResponse.json({ ok: true, role, user: serialize(user as typeof user & { _id: import("mongodb").ObjectId }) });
  } catch (error) {
    console.error("Firebase authentication failed", error);
    return NextResponse.json({ error: "Firebase нэвтрэлт амжилтгүй боллоо." }, { status: 401 });
  }
}
