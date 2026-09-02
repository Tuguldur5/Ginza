"use client";

import { useState } from "react";
import Image from "next/image";
import type { Question, Room } from "@/lib/mongodb";

export default function FeedbackForm({
  roomNumber,
  room,
  questions = [],
  inactive,
  error,
}: {
  roomNumber: number;
  room?: Room;
  questions?: Question[];
  inactive?: boolean;
  error?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState(error || "");

  if (inactive || error) {
    return (
      <main className="container" style={{ padding: "80px 0" }}>
        <div className="card success">
          <Image
            src="/images/Ginza.jpg"
            alt="Ginza Karaoke"
            width={140}
            height={100}
            style={{ objectFit: "contain" }}
          />
          <h1>Санал хүсэлт</h1>
          <p className="muted">
            {error ||
              "Энэ өрөөний санал хүсэлтийн холбоос одоогоор идэвхгүй байна."}
          </p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="container" style={{ padding: "70px 0" }}>
        <div className="card success">
          <div className="success-icon">✓</div>
          <h1>Баярлалаа!</h1>
          <p className="muted">Таны санал хүсэлтийг амжилттай хүлээн авлаа.</p>
        </div>
      </main>
    );
  }

  const submit = async () => {
    setMessage("");
    const rating = questions.find((q) => q.type === "rating");
    if (
      questions.some((q) => q.required && !answers[q.id]) ||
      (rating && !answers[rating.id])
    ) {
      setMessage("Заавал бөглөх талбаруудыг бүрэн бөглөнө үү.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber,
          answers: questions.map((q) => ({
            questionId: q.id,
            answer: answers[q.id] || "",
          })),
          comment: answers.comment || "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDone(true);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Санал илгээх үед алдаа гарлаа."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="form-container">
      {/* Background Логотой Hero Хэсэг */}
      <section className="hero-section">
        <div className="hero-bg-logo">
          <Image
            src="/images/Ginza.jpg"
            alt="Ginza Background"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="tag tag-gray">GINZA KARAOKE · УЛААНБААТАР</div>
          <h1>Санал хүсэлт</h1>
          <p className="muted">Өрөө {room?.roomNumber || roomNumber}</p>
        </div>
      </section>

      {/* Асуултууд болон Форм */}
      <section className="card form-card" style={{ marginBottom: 50 }}>
        <h2>Өрөө {room?.roomNumber || roomNumber}</h2>

        {questions.map((q) => (
          <div className="question" key={q.id}>
            <div className="question-label">
              {q.text}
              {q.required && <span style={{ color: "#c2410c" }}> *</span>}
            </div>
            {q.type === "rating" ? (
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    aria-label={`${n} оноо`}
                    key={n}
                    className={`star ${
                      answers[q.id] === String(n) ? "active" : ""
                    }`}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [q.id]: String(n) }))
                    }
                  >
                    {n <= Number(answers[q.id] || 0) ? "★" : "☆"}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="textarea"
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
                placeholder="Энд бичнэ үү..."
              />
            )}
          </div>
        ))}

        <div className="question">
          <div className="question-label">📝 Нэмэлт санал, сэтгэгдэл</div>
          <textarea
            className="textarea"
            value={answers.comment || ""}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, comment: e.target.value }))
            }
          />
        </div>

        {message && (
          <div
            style={{
              background: "#fff3f2",
              color: "#b42318",
              padding: 12,
              borderRadius: 12,
            }}
          >
            {message}
          </div>
        )}

        <button
          className="btn btn-primary"
          disabled={sending}
          style={{ width: "100%", marginTop: 22, padding: 14 }}
          onClick={submit}
        >
          {sending ? "Илгээж байна..." : "Санал илгээх"}
        </button>
      </section>
    </main>
  );
}