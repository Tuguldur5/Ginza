"use client";

import { useState } from "react";

const scaleOptions = [
  { value: 0.85, label: "Жижиг", detail: "85%" },
  { value: 1, label: "Дунд", detail: "100% - default" },
  { value: 1.15, label: "Том", detail: "115%" },
];

export default function Settings() {
  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const storedScale = window.localStorage.getItem("admin_ui_scale");
    return storedScale === "0.85" ||
      storedScale === "1" ||
      storedScale === "1.15"
      ? Number(storedScale)
      : 1;
  });

  const selectScale = (value: number) => {
    setScale(value);
    window.localStorage.setItem("admin_ui_scale", String(value));
    window.dispatchEvent(
      new CustomEvent("admin-ui-scale-change", { detail: value }),
    );
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <div className="eyebrow">СИСТЕМИЙН ТОХИРГОО</div>
          <h1>Тохиргоо</h1>
          <p className="muted">Админ панелийн харагдах байдлыг өөрчилнө.</p>
        </div>
      </header>
      <section className="card dashboard-section">
        <h2>Админ панелийн хэмжээ (UI Scale)</h2>
        <p className="muted">
          Энэ тохиргоо зөвхөн админ хэсгийн фонт болон элементүүдэд үйлчилнэ.
        </p>
        <div
          className="scale-options"
          role="radiogroup"
          aria-label="Админ панелийн хэмжээ"
        >
          {scaleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={scale === option.value}
              className={`scale-option ${scale === option.value ? "selected" : ""}`}
              onClick={() => selectScale(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.detail}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="card dashboard-section">
        <h2>Системийн орчин</h2>
        <div className="user-row">
          <span>Өгөгдлийн сан</span>
          <strong>MongoDB Atlas</strong>
        </div>
        <div className="user-row">
          <span>Өгөгдлийн сангийн нэр</span>
          <strong>ginza_feedback</strong>
        </div>
      </section>
    </>
  );
}
