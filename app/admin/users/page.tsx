"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/app/components/Modal";
import { ToggleSwitch } from "@/app/components/ToggleSwitch";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";

type User = {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ username: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setError("Хэрэглэгчдийг ачаалж чадсангүй."));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "admin" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setForm({ username: "", name: "", password: "" });
      setError("");
      setShowAddModal(false);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (user: User) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (!response.ok) setError((await response.json()).error);
    else await load();
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    const response = await fetch(`/api/admin/users/${deleteConfirm.id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      setError((await response.json()).error || "Хэрэглэгчийг устгаж чадсангүй.");
    else await load();
    setDeleteConfirm(null);
  };

  return (
    <main className="admin-main standalone-admin">
      <header className="admin-header">
        <div>
          <div className="eyebrow">АДМИН СИСТЕМ</div>
          <h1>Хэрэглэгчид</h1>
        </div>
        <button
          className="btn btn-add"
          onClick={() => setShowAddModal(true)}
        >
          + Хэрэглэгч нэмэх
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      <section className="card dashboard-section">
        <h2>Бүртгэлтэй хэрэглэгчид</h2>
        {users.length === 0 ? (
          <p className="muted">Одоогоор хэрэглэгч бүртгэгдээгүй байна.</p>
        ) : (
          users.map((user) => (
            <div className="user-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <small className="muted">@{user.username}</small>
                <small className="muted">
                  {new Date(user.createdAt).toLocaleString("mn-MN")}
                </small>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <ToggleSwitch
                  checked={user.isActive}
                  onChange={() => toggle(user)}
                />
                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirm(user)}
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
        title="Шинэ хэрэглэгч нэмэх"
        onClose={() => {
          setShowAddModal(false);
          setForm({ username: "", name: "", password: "" });
          setError("");
        }}
        actions={[
          {
            label: "Цуцлах",
            onClick: () => {
              setShowAddModal(false);
              setForm({ username: "", name: "", password: "" });
              setError("");
            },
            variant: "soft",
          },
          {
            label: "Хэрэглэгч нэмэх",
            onClick: add,
            variant: "primary",
          },
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="field-label">Нэвтрэх нэр</label>
            <input
              className="input"
              placeholder="Нэвтрэх нэр"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="field-label">Нэр</label>
            <input
              className="input"
              placeholder="Нэр"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Нууц үг (8+ тэмдэгт)</label>
            <input
              className="input"
              type="password"
              placeholder="Нууц үг"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Хэрэглэгчийг устгах"
        message="Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
        onConfirm={remove}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Устгах"
        cancelText="Цуцлах"
        isDangerous={true}
      />
    </main>
  );
}
