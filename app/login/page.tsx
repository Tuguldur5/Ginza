"use client";
import { FormEvent, useState } from "react";
import { signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createPhoneRecaptcha, getFirebaseAuth } from "@/lib/firebase";

const cleanPhone = (value: string) => value.replace(/\D/g, "").slice(0, 8);
const firebaseMessage = (code: string) => ({ "auth/invalid-phone-number": "Утасны дугаар буруу байна.", "auth/too-many-requests": "Хэт олон хүсэлт илгээгдсэн байна. Түр хүлээгээд дахин оролдоно уу.", "auth/quota-exceeded": "OTP хүсэлтийн хязгаарт хүрсэн байна.", "auth/invalid-verification-code": "OTP код буруу байна." }[code] || "Нэвтрэх үед алдаа гарлаа.");

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!/^\d{8}$/.test(phone)) { setError("8 оронтой Монгол утасны дугаар оруулна уу."); return; }
    setLoading(true);
    try {
      const verifier = createPhoneRecaptcha("firebase-recaptcha");
      const result = await signInWithPhoneNumber(getFirebaseAuth(), `+976${phone}`, verifier);
      setConfirmation(result);
    } catch (value) { const firebaseError = value as { code?: string }; setError(firebaseMessage(firebaseError.code || "")); }
    finally { setLoading(false); }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!confirmation || !/^\d{6}$/.test(code)) { setError("SMS-ээр ирсэн 6 оронтой кодоо оруулна уу."); return; }
    setLoading(true);
    try {
      const credential = await confirmation.confirm(code);
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/firebase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Нэвтрэлт амжилтгүй боллоо.");
      router.replace(data.role === "admin" ? "/admin/dashboard" : "/profile"); router.refresh();
    } catch (value) { const firebaseError = value as { code?: string }; setError(firebaseError.code ? firebaseMessage(firebaseError.code) : value instanceof Error ? value.message : "OTP шалгахад алдаа гарлаа."); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><div className="auth-card"><div className="eyebrow">GINZA · НЭВТРЭХ</div><h1>{confirmation ? "OTP код оруулна уу" : "Тавтай морил"}</h1><p className="muted">{confirmation ? `+976 ${phone} дугаарт SMS код илгээлээ.` : "Утасны дугаараа оруулж нэвтэрнэ үү."}</p>{confirmation ? <form onSubmit={verifyCode}><label className="field-label" htmlFor="code">Баталгаажуулах код</label><input id="code" className="input otp-input" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoFocus value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /><button className="btn btn-primary auth-submit" disabled={loading}>{loading ? "Шалгаж байна..." : "Нэвтрэх"}</button><button type="button" className="btn btn-soft auth-submit" onClick={() => { setConfirmation(null); setCode(""); }}>Дугаараа солих</button></form> : <form onSubmit={sendCode}><label className="field-label" htmlFor="phone">Утасны дугаар</label><div className="phone-input"><span>+976</span><input id="phone" className="input" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={phone} onChange={event => setPhone(cleanPhone(event.target.value))} placeholder="99112233" autoComplete="tel" required /></div><button className="btn btn-primary auth-submit" disabled={loading}>{loading ? "SMS илгээж байна..." : "OTP авах"}</button></form>}{error && <div className="form-error" role="alert">{error}</div>}<div id="firebase-recaptcha" /></div></main>;
}
