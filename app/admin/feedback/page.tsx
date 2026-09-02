"use client";
import { useEffect, useState } from "react";
type Feedback = {
  id: string;
  roomNumber: number;
  rating: number;
  comment: string;
  createdAt: string;
  status?: "active" | "archived";
  answers: { questionId: string; answer: string }[];
};
export default function AdminFeedback() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [room, setRoom] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<Feedback | null>(null);
  const [error, setError] = useState("");
  const load = () =>
    fetch(`/api/feedback${showArchived ? "?status=all" : ""}`)
      .then((r) => r.json())
      .then((d) => setItems(d.feedback || []))
      .catch(() => setError("Санал хүсэлтийг ачаалж чадсангүй."));
  useEffect(() => {
    load();
  }, [showArchived]);
  const filtered = items.filter(
    (item) =>
      (room === "all" || String(item.roomNumber) === room) &&
      (rating === "all" || String(item.rating) === rating) &&
      (!search ||
        `${item.comment} ${item.answers.map((a) => a.answer).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const save = async () => {
    if (!editing) return;
    const r = await fetch(`/api/feedback/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: editing.rating,
        comment: editing.comment,
      }),
    });
    if (!r.ok) setError((await r.json()).error);
    else {
      setEditing(null);
      load();
    }
  };
  const action = async (item: Feedback, status?: string) => {
    if (status) {
      await fetch(`/api/feedback/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } else if (
      confirm(
        "Энэ санал хүсэлтийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.",
      )
    ) {
      await fetch(`/api/feedback/${item.id}`, { method: "DELETE" });
    }
    load();
  };
  const rooms = [...new Set(items.map((item) => item.roomNumber))].sort(
    (a, b) => a - b,
  );
  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">САНАЛЫН БҮРТГЭЛ</div>
          <h1>Санал хүсэлт</h1>
        </div>
      </header>
      <div className="filter-row">
        <input
          className="input"
          placeholder="Түлхүүр үгээр хайх"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        >
          <option value="all">Бүх өрөө</option>
          {rooms.map((number) => (
            <option key={number} value={number}>
              Өрөө {number}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="all">Бүх үнэлгээ</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} од
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />{" "}
          Архивлагдсан
        </label>
      </div>
      {error && <div className="form-error">{error}</div>}
      <section className="card dashboard-section">
        {filtered.length === 0 ? (
          <p className="muted">Одоогоор санал хүсэлт ирээгүй байна.</p>
        ) : (
          filtered.map((item) => (
            <article className="feedback-detail" key={item.id}>
              <div className="feedback-item">
                <div>
                  <strong>Өрөө {item.roomNumber}</strong>
                  <div className="muted">
                    {new Date(item.createdAt).toLocaleString("mn-MN")}
                  </div>
                </div>
                <span className="rating-pill">{item.rating} / 5</span>
              </div>
              {item.comment && <p>{item.comment}</p>}
              <div className="action-stack">
                <button
                  className="btn btn-soft"
                  onClick={() => setEditing(item)}
                >
                  Засах
                </button>
                <button
                  className="btn btn-soft"
                  onClick={() =>
                    action(
                      item,
                      item.status === "archived" ? "active" : "archived",
                    )
                  }
                >
                  {item.status === "archived"
                    ? "Буцааж идэвхжүүлэх"
                    : "Архивлах"}
                </button>
                <button className="btn btn-danger" onClick={() => action(item)}>
                  Устгах
                </button>
              </div>
            </article>
          ))
        )}
      </section>
      {editing && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Санал хүсэлт засах</h2>
            <label className="field-label">Үнэлгээ</label>
            <input
              className="input"
              type="number"
              min="1"
              max="5"
              value={editing.rating}
              onChange={(e) =>
                setEditing({ ...editing, rating: Number(e.target.value) })
              }
            />
            <label className="field-label">Нэмэлт сэтгэгдэл</label>
            <textarea
              className="textarea"
              value={editing.comment}
              onChange={(e) =>
                setEditing({ ...editing, comment: e.target.value })
              }
            />
            <div className="action-stack">
              <button className="btn btn-soft" onClick={() => setEditing(null)}>
                Цуцлах
              </button>
              <button className="btn btn-primary" onClick={save}>
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
