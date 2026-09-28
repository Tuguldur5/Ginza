"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Feedback = {
  id: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
};
export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data) => setItems(data.feedback || []));
  }, []);
  const average = items.length
    ? (
        items.reduce((sum, item) => sum + item.rating, 0) / items.length
      ).toFixed(1)
    : "-";
  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">GINZA · УДИРДЛАГА</div>
          <h1>Хянах самбар</h1>
          <p className="muted">
            Санал хүсэлт болон loyalty үйл ажиллагааны тойм.
          </p>
        </div>
        
      </header>
      <div className="stat-grid">
        <div className="card stat">
          <span>Нийт санал</span>
          <strong>{items.length}</strong>
        </div>
        <div className="card stat">
          <span>Дундаж үнэлгээ</span>
          <strong>
            {average}
            <small> / 5</small>
          </strong>
        </div>
      </div>
      <section className="card dashboard-section">
        <div className="section-heading">
          <h2>Сүүлийн санал</h2>
          <Link href="/admin/feedbacks" className="text-link">
            Бүгдийг харах
          </Link>
        </div>
        {items.slice(0, 6).map((item) => (
          <article className="feedback-item" key={item.id}>
            <div>
              <strong>{item.userName || "Нэргүй"}</strong>
              <div className="muted">{item.comment}</div>
            </div>
            <span className="rating-pill">{item.rating} / 5</span>
          </article>
        ))}
      </section>
    </>
  );
}
