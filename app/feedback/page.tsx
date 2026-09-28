"use client";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { name?: string };
type Question = {
  id: string;
  text: string;
  type: "rating" | "text" | "textarea";
  required: boolean;
};
export default function FeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
    fetch("/api/questions")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.questions) setQuestions(data.questions);
      });
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: guestName,
        phone: guestPhone,
        comment,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error);
    setDone(true);
  };
  if (done)
    return (
      <main className="public-shell">
        <div className="container feedback-center">
          <div className="success-icon">✓</div>
          <h1>Баярлалаа!</h1>
          <p className="muted">Таны санал хүсэлт бидэнд хүрлээ.</p>
          <button
            className="btn btn-primary"
            onClick={() => router.push(user ? "/profile" : "/feedback")}
          >
            Буцах
          </button>
        </div>
      </main>
    );
  return (
    <main className="public-shell">
      <div className="container feedback-wrap">
        <header className="public-header feedback-topbar">
          <div className="ginza-user-brand">
            <Image src="/images/Ginza.jpg" alt="Ginza" width={70} height={42} />
            <div>
              <div className="eyebrow">GINZA · ТАНЫ ДУУ ХООЛОЙ</div>
              <h1>Санал хүсэлт</h1>
            </div>
          </div>
          
        </header>
        <p className="muted">
          Нэвтрэх шаардлагагүй. Үнэлгээ болон сэтгэгдлээ шууд үлдээнэ үү.
        </p>
        <form className="card feedback-panel" onSubmit={submit}>
          {!user && (
            <div className="guest-fields">
              <input
                className="input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={guestPhone}
                onChange={(event) =>
                  setGuestPhone(
                    event.target.value.replace(/\D/g, "").slice(0, 8),
                  )
                }
                placeholder="Утасны дугаар (заавал биш)"
              />
              <input
                className="input"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Нэр (заавал биш)"
                maxLength={80}
              />
            </div>
          )}
          {questions.map((question) => (
            <div className="question" key={question.id}>
              <label className="field-label">
                {question.text}
                {question.required && " *"}
              </label>
              {question.type === "rating" ? (
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={
                        answers[question.id] === String(value)
                          ? "rating-star active"
                          : "rating-star"
                      }
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: String(value),
                        }))
                      }
                      aria-label={`${value} од`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="textarea"
                  required={question.required}
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Энд бичнэ үү..."
                />
              )}
            </div>
          ))}
          <label className="field-label" htmlFor="comment">
            Нэмэлт сэтгэгдэл
          </label>
          <textarea
            id="comment"
            className="textarea"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Санал, хүсэлтээ энд бичнэ үү..."
            maxLength={3000}
          />
          {message && <div className="form-error">{message}</div>}
          <button className="btn btn-primary feedback-submit">
            Санал илгээх
          </button>
        </form>
      </div>
    </main>
  );
}
