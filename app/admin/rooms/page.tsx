"use client";

import { useEffect, useState } from "react";
// Шаардлагатай компонентүүдийг импортлох (Таны төслийн бүтцээс хамаарч замыг тааруулна уу)
import { Modal } from "@/app/components/Modal";
import { ToggleSwitch } from "@/app/components/ToggleSwitch";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";

type Room = {
  id: string;
  roomNumber: number;
  name: string;
  isActive: boolean;
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms || []))
      .catch(() => setError("Өрөөнүүдийг ачаалж чадсангүй."));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!number || !name) {
      setError("Мэдээллийг бүрэн бөглөнө үү.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber: Number(number), name }),
      });
      if (!r.ok) {
        setError((await r.json()).error || "Хадгалж чадсангүй.");
        return;
      }
      // Амжилттай болбол формыг цэвэрлээд, модалыг хаах
      setNumber("");
      setName("");
      setError("");
      setShowAddModal(false);
      await load(); // Жагсаалтыг шинэчлэх
    } catch (e) {
      setError("Сүлжээний алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (room: Room) => {
    // Backend руу шинэ төлөвийг илгээх
    await fetch(`/api/rooms/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !room.isActive }),
    });
    // Жагсаалтыг дахин ачаалах (эсвэл local state-ийг шинэчлэх)
    await load();
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    const r = await fetch(`/api/rooms/${deleteConfirm.id}`, {
      method: "DELETE",
    });
    if (!r.ok)
      setError((await r.json()).error || "Өрөөг устгаж чадсангүй.");
    else await load();
    setDeleteConfirm(null); // Устгасны дараа диалогийг хаах
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">ОРЧНЫ БҮРТГЭЛ</div>
          <h1>Өрөөнүүд</h1>
          <p className="muted">
            Өрөөний төлөв, QR холбоос болон нэршлийг удирдана.
          </p>
        </div>
        {/* Нэмэх товчийг баруун дээд хэсэгт байрлуулсан */}
        <button
          className="btn btn-add"
          onClick={() => setShowAddModal(true)}
        >
          + Өрөө нэмэх
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      <div className="room-layout">
        <section className="card dashboard-section room-list">
          <h2>Өрөөний жагсаалт</h2>
          {rooms.length === 0 ? (
            <p className="muted">Одоогоор өрөө бүртгэгдээгүй байна.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 0",
                  borderBottom: "1px solid #edf0f2",
                  cursor: "pointer",
                }}
                onClick={() => setSelected(room)}
                className={selected?.id === room.id ? "selected" : ""}
              >
                <span>
                  <b>Өрөө {room.roomNumber}</b>
                  <small style={{ display: "block", color: "#7b858e", marginTop: "5px" }}>
                    {room.name}
                  </small>
                </span>
                {/* Жагсаалт дээр шууд солих Switch товч */}
                <div onClick={(e) => e.stopPropagation()}>
                  <ToggleSwitch
                    checked={room.isActive}
                    onChange={() => toggle(room)}
                  />
                </div>
              </div>
            ))
          )}
        </section>

        <section className="card dashboard-section">
          {selected ? (
            <>
              <div className="eyebrow">СОНГОСОН ӨРӨӨ</div>
              <h2>{selected.name}</h2>
              <p className="muted">
                Өрөө дугаар: <strong>{selected.roomNumber}</strong>
              </p>

              <div className="toggle-item">
                <span>Идэвхтэй</span>
                <ToggleSwitch
                  checked={selected.isActive}
                  onChange={() => toggle(selected)}
                />
              </div>

              <div className="action-stack" style={{ marginTop: "24px" }}>
                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirm(selected)}
                >
                  🗑️ Устгах
                </button>
              </div>

              <div style={{ marginTop: "24px" }}>
                <a
                  href={`/admin/rooms?id=${selected.id}&qr=1`}
                  className="btn btn-soft"
                >
                  QR холбоос
                </a>
              </div>
            </>
          ) : (
            <p className="muted">Өрөө сонгоно уу</p>
          )}
        </section>

        {/* Гуравдахь баганыг хоосон карт хэвээр үлдээв */}
        <section className="card dashboard-section" />
      </div>

      {/* Өрөө нэмэх Popup (Modal) */}
      <Modal
        isOpen={showAddModal}
        title="Шинэ өрөө нэмэх"
        onClose={() => {
          setShowAddModal(false);
          setNumber("");
          setName("");
          setError("");
        }}
        actions={[
          {
            label: "Цуцлах",
            onClick: () => {
              setShowAddModal(false);
              setNumber("");
              setName("");
              setError("");
            },
            variant: "soft",
          },
          {
            label: loading ? "Хадгалж байна..." : "Хадгалах",
            onClick: add,
            variant: "primary",
            disabled: loading,
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="field-label">Өрөө дугаар</label>
            <input
              className="input"
              type="number"
              placeholder="Өрөө дугаар"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Өрөөний нэр</label>
            <input
              className="input"
              placeholder="Өрөөний нэр"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
      </Modal>

      {/* Устгахыг баталгаажуулах Pop-up */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Өрөөг устгах"
        message="Та энэ өрөөг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
        onConfirm={remove}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Устгах"
        cancelText="Цуцлах"
        isDangerous={true}
      />
    </>
  );
}