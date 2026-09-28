import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const phonePattern = /^\d{8}$/;

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (typeof phone !== "string" || !phonePattern.test(phone)) return NextResponse.json({ error: "8 оронтой Монгол утасны дугаар оруулна уу." }, { status: 400 });
    const smsConfigured = Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY);
    if (!smsConfigured) return NextResponse.json({ error: "SMS үйлчилгээ тохируулагдаагүй байна." }, { status: 503 });
    const code = String(Math.floor(1000 + Math.random() * 9000));
    await (await getDb()).collection("otp_codes").updateOne({ phone }, { $set: { phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 } }, { upsert: true });
    if (smsConfigured) {
      const smsResponse = await fetch(process.env.SMS_API_URL as string, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SMS_API_KEY}` }, body: JSON.stringify({ to: `+976${phone}`, message: `Таны Ginza OTP код: ${code}. 5 минутын хугацаатай.` }) });
      if (!smsResponse.ok) return NextResponse.json({ error: "SMS илгээж чадсангүй. Дахин оролдоно уу." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "OTP илгээх үед алдаа гарлаа." }, { status: 500 });
  }
}