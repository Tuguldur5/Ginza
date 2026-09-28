"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OtpForm({ phone }: { phone: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.replace(data.role === "admin" ? "/admin/dashboard" : "/profile");
      router.refresh();
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Код шалгахад алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page loyalty-auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">OTP БАТАЛГААЖУУЛАЛТ</div>
        <h1>Кодоо оруулна уу</h1>
        <p className="muted">+976 {phone} дугаарт илгээсэн 4 оронтой код.</p>
        <label className="field-label" htmlFor="otp">
          OTP код
        </label>
        <input
          id="otp"
          className="input otp-input"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
          autoFocus
          required
        />
        {process.env.NODE_ENV !== "production" && (
          <p className="muted otp-hint">Local development код: 1234</p>
        )}
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? "Шалгаж байна..." : "Нэвтрэх"}
        </button>
        <button
          type="button"
          className="btn btn-soft auth-submit"
          onClick={() => router.back()}
        >
          Дугаараа солих
        </button>
      </form>
    </main>
  );
}
