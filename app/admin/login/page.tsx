"use client";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Нэвтрэх үед алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-card text-center">
        <Image
          src="/images/Ginza.jpg"
          alt="Ginza Karaoke"
          width={180}
          height={120}
          className="auth-logo"
          style={{ borderRadius: "14px" }}
          priority
        />
        <h1>Нэвтрэх</h1>
        <p className="muted">Санал хүсэлтийн удирдлагын хэсэгт нэвтэрнэ үү.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="username">
            Нэвтрэх нэр
          </label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <label className="field-label" htmlFor="password">
            Нууц үг
          </label>
          <div className="password-field">
            <input
              id="password"
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Нуух" : "Харах"}
            </button>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </main>
  );
}
