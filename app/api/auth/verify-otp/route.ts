import { NextResponse } from "next/server";
import { createUserSession } from "@/lib/auth";
import { getDb, serialize } from "@/lib/mongodb";

const phonePattern = /^\d{8}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body.phone === "string" ? body.phone : "";
    const code = typeof body.code === "string" ? body.code : "";
    if (!phonePattern.test(phone) || !/^\d{4}$/.test(code)) return NextResponse.json({ error: "Утасны дугаар эсвэл OTP код буруу байна." }, { status: 400 });
    const db = await getDb();
    const otp = await db.collection("otp_codes").findOne({ phone, code, expiresAt: { $gt: new Date() } });
    if (!otp) return NextResponse.json({ error: "OTP код буруу эсвэл хугацаа дууссан байна." }, { status: 401 });
    const admin = await db.collection("admin_users").findOne({ phone, role: "admin", isActive: true });
    const role = admin ? "admin" : "user";
    const user = admin || await db.collection("loyalty_users").findOneAndUpdate({ phone }, { $setOnInsert: { phone, name: "", stamps: 0, coupons: 0, role: "user", isActive: true, createdAt: new Date() }, $set: { updatedAt: new Date() } }, { upsert: true, returnDocument: "after" });
    if (!user?._id) return NextResponse.json({ error: "Хэрэглэгч үүсгэхэд алдаа гарлаа." }, { status: 500 });
    await db.collection("otp_codes").deleteOne({ _id: otp._id });
    await createUserSession({ id: user._id.toString(), phone, role });
    return NextResponse.json({ ok: true, role, user: serialize(user as typeof user & { _id: import("mongodb").ObjectId }) });
  } catch {
    return NextResponse.json({ error: "Нэвтрэх үед алдаа гарлаа." }, { status: 500 });
  }
}