"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/app/components/Modal";
import { ToggleSwitch } from "@/app/components/ToggleSwitch";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";

type Q = {
  id: string;
  text: string;
  type: "rating" | "text" | "textarea";
  required: boolean;
  isActive: boolean;
  order: number;
};

export default function Questions() {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [text, setText] = useState("");
  const [type, setType] = useState<Q["type"]>("textarea");
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Q | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const load = () =>
    fetch("/api/questions?all=1")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []))
      .catch(() => setError("Асуултуудыг ачаалж чадсангүй."));

  useEffect(() => {
    load();
  }, []);

  const update = async (q: Q, change: Record<string, unknown>) => {
    await fetch("/api/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, ...change }),
    });
    await load();
  };

  const add = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          type,
          required,
          isActive: true,
        }),
      });
      if (!r.ok) setError((await r.json()).error);
      else {
        setText("");
        setRequired(false);
        setType("textarea");
        setError("");
        setShowAddModal(false);
        await load();
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    await fetch("/api/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteConfirm.id }),
    });
    await load();
    setDeleteConfirm(null);
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">ФОРМЫН ТОХИРГОО</div>
          <h1>Асуултууд</h1>
          <p className="muted">Зочдын санал авах асуултыг удирдана.</p>
        </div>
        <button
          className="btn btn-add"
          onClick={() => setShowAddModal(true)}
        >
          + Асуулт нэмэх
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      <section className="card dashboard-section">
        <h2>Асуултуудын жагсаалт</h2>
        {questions.length === 0 ? (
          <p className="muted">Одоогоор асуулт бүртгэгдээгүй байна.</p>
        ) : (
          questions.map((q, index) => (
            <div className="question-row" key={q.id}>
              <div>
                {editingId === q.id ? <div className="question-edit"><input className="input" value={editingText} onChange={(event) => setEditingText(event.target.value)} /><button className="btn btn-primary" onClick={() => { update(q, { text: editingText }); setEditingId(null); }}>Хадгалах</button></div> : <strong>{q.text}</strong>}
                <small className="muted">
                  {q.type === "rating" && "Үнэлгээ"}
                  {q.type === "text" && "Богино текст"}
                  {q.type === "textarea" && "Дэлгэрэнгүй текст"}
                  {q.required && " • Заавал бөглөх"}
                </small>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <ToggleSwitch
                  checked={q.isActive}
                  onChange={() =>
                    update(q, { isActive: !q.isActive })
                  }
                />
                <button className="btn btn-soft" disabled={index === 0} onClick={() => update(q, { order: q.order - 1 })} aria-label="Дээш зөөх">↑</button>
                <button className="btn btn-soft" disabled={index === questions.length - 1} onClick={() => update(q, { order: q.order + 1 })} aria-label="Доош зөөх">↓</button>
                <button className="btn btn-soft" onClick={() => { setEditingId(q.id); setEditingText(q.text); }}>Засах</button>
                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirm(q)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <Modal
        isOpen={showAddModal}
        title="Шинэ асуулт нэмэх"
        onClose={() => {
          setShowAddModal(false);
          setText("");
          setRequired(false);
          setType("textarea");
          setError("");
        }}
        actions={[
          {
            label: "Цуцлах",
            onClick: () => {
              setShowAddModal(false);
              setText("");
              setRequired(false);
              setType("textarea");
              setError("");
            },
            variant: "soft",
          },
          {
            label: "Хадгалах",
            onClick: add,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="field-label">Асуултаа бичнэ үү</label>
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Асуултаа бичнэ үү"
              rows={3}
            />
          </div>
          <div>
            <label className="field-label">Асуултын төрөл</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as Q["type"])}
            >
              <option value="rating">Үнэлгээ</option>
              <option value="text">Богино текст</option>
              <option value="textarea">Дэлгэрэнгүй текст</option>
            </select>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <span>Заавал бөглөх</span>
          </label>
          {error && <p className="form-error">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Асуултыг устгах"
        message="Та энэ асуултыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
        onConfirm={remove}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Устгах"
        cancelText="Цуцлах"
        isDangerous={true}
      />
    </>
  );
}
