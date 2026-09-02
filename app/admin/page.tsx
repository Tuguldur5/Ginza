"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
type Feedback = {
  id: string;
  roomNumber: number;
  rating: number;
  comment: string;
  createdAt: string;
  status?: "active" | "archived";
};
export default function Admin() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [rooms, setRooms] = useState<{ isActive: boolean }[]>([]);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());
  useEffect(() => {
    Promise.all([
      fetch("/api/feedback").then((r) => r.json()),
      fetch("/api/rooms").then((r) => r.json()),
    ])
      .then(([f, r]) => {
        setItems(
          (f.feedback || []).filter((x: Feedback) => x.status !== "archived"),
        );
        setRooms(r.rooms || []);
      })
      .catch(() => setError("Мэдээллийг ачаалж чадсангүй."));
  }, []);
  const today = new Date(now).toISOString().slice(0, 10);
  const week = now - 7 * 86400000;
  const average = useMemo(
    () =>
      items.length
        ? (
            items.reduce((sum, item) => sum + item.rating, 0) / items.length
          ).toFixed(1)
        : "-",
    [items],
  );
  const low = items.filter((item) => item.rating <= 2).length;
  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">УДИРДЛАГЫН ХЭСЭГ</div>
          <h1>Хянах самбар</h1>
          <p className="muted">
            Үйлчилгээний чанарыг бодит санал дээр тулгуурлан хянаарай.
          </p>
        </div>
        <Link href="/feedback/room/1" className="btn btn-soft">
          Хэрэглэгчийн хуудас
        </Link>
      </header>
      {error && <div className="form-error">{error}</div>}
      <div className="stat-grid">
        <div className="card stat">
          <span>Нийт санал</span>
          <strong>{items.length}</strong>
        </div>
        <div className="card stat">
          <span>Өнөөдрийн санал</span>
          <strong>
            {
              items.filter((item) => item.createdAt.slice(0, 10) === today)
                .length
            }
          </strong>
        </div>
        <div className="card stat">
          <span>Дундаж үнэлгээ</span>
          <strong>
            {average}
            <small> / 5</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Идэвхтэй өрөө</span>
          <strong>{rooms.filter((room) => room.isActive).length}</strong>
        </div>
        <div className="card stat">
          <span>Сүүлийн 7 хоног</span>
          <strong>
            {
              items.filter((item) => new Date(item.createdAt).getTime() >= week)
                .length
            }
          </strong>
        </div>
        <div className="card stat">
          <span>1-2 одтой санал</span>
          <strong>{low}</strong>
        </div>
      </div>
      <div className="admin-two-column">
        <section className="card dashboard-section">
          <div className="section-heading">
            <h2>Сүүлийн санал хүсэлт</h2>
            <Link href="/admin/feedback" className="text-link">
              Бүгдийг харах
            </Link>
          </div>
          {items.length ? (
            items.slice(0, 6).map((item) => (
              <article className="feedback-item" key={item.id}>
                <div>
                  <strong>Өрөө {item.roomNumber}</strong>
                  <div className="muted">
                    {item.comment || "Нэмэлт сэтгэгдэлгүй"}
                  </div>
                  <small>
                    {new Date(item.createdAt).toLocaleString("mn-MN")}
                  </small>
                </div>
                <span className="rating-pill">
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </span>
              </article>
            ))
          ) : (
            <p className="muted">Одоогоор санал хүсэлт ирээгүй байна.</p>
          )}
        </section>
        <section className="card dashboard-section">
          <h2>Анхаарах зүйл</h2>
          {low ? (
            <p>
              1-2 одтой {low} санал байна. Дэлгэрэнгүй хариултуудыг шалгана уу.
            </p>
          ) : (
            <p className="muted">
              Одоогоор анхаарах шаардлагатай мэдээлэл алга.
            </p>
          )}
          <h2>Сайжруулах зөвлөмж</h2>
          {items.length >= 3 ? (
            <p>
              Давтагдсан сэдвүүдийг шинжилгээний хуудсаар тогтмол хянаж, арга
              хэмжээ аваарай.
            </p>
          ) : (
            <p className="muted">
              Зөвлөмж гаргахад одоогоор хангалттай мэдээлэл алга.
            </p>
          )}
          <Link href="/admin/analytics" className="text-link">
            Дэлгэрэнгүй шинжилгээ
          </Link>
        </section>
      </div>
    </>
  );
}
