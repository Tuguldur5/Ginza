"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, FileText, Gift, LayoutDashboard, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  ["/admin/dashboard", "Хянах самбар", LayoutDashboard],
  ["/admin/feedbacks", "Санал хүсэлт", FileText],
  ["/admin/loyalty", "Loyalty & купон", Gift],
  ["/admin/analytics", "Шинжилгээ", BarChart3],
  ["/admin/users", "Админ хэрэглэгчид", Users],
] as const;

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uiScale, setUiScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const storedScale = window.localStorage.getItem("admin_ui_scale");
    return storedScale === "0.85" || storedScale === "1" || storedScale === "1.15" ? Number(storedScale) : 1;
  });

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const handleScaleChange = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      if (value === 0.85 || value === 1 || value === 1.15) setUiScale(value);
    };
    window.addEventListener("admin-ui-scale-change", handleScaleChange);
    return () => window.removeEventListener("admin-ui-scale-change", handleScaleChange);
  }, []);

  useEffect(() => {
    if (!isLogin)
      fetch("/api/auth/session").then((response) => {
        if (!response.ok) router.replace("/admin/login");
      });
  }, [isLogin, pathname, router]);

  useEffect(() => {
    document.body.classList.toggle("admin-drawer-open", open);
    return () => document.body.classList.remove("admin-drawer-open");
  }, [open]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (isLogin) return <>{children}</>;

  return (
    <div className="admin-shell" style={{ "--admin-ui-scale": uiScale } as React.CSSProperties}>
      <button
        type="button"
        className="mobile-menu"
        aria-label="Цэс нээх"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>

      {open && (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Цэс хаах"
          onClick={() => setOpen(false)}
        />
      )}

      <aside 
        className={`admin-sidebar ${open ? "open" : ""}`} 
        aria-label="Админ цэс"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div className="sidebar-brand">
          <Image
            src="/images/Ginza.jpg"
            alt="Ginza Karaoke"
            width={100}
            height={58}
          />
          <span className="sidebar-brand-text text-lg font-bold">
            Санал хүсэлт
          </span>
          <button
            type="button"
            className="drawer-close"
            aria-label="Цэс хаах"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          {navigation.map(([href, label, Icon]) => (
            <Link
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              className={
                pathname === href || pathname.startsWith(href)
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          <Link 
            className={`nav-item settings-link ${pathname === "/admin/settings" ? "active" : ""}`} 
            href="/admin/settings" 
            onClick={() => setOpen(false)}
          >
            <Settings size={18} />
            <span>Тохиргоо</span>
          </Link>
        </nav>

        {/* position: relative & margin-top: auto өгснөөр доор бэхлэгдэнэ */}
        <button 
          type="button" 
          className="sidebar-logout text-center" 
          onClick={logout}
          style={{
            position: "relative",
            top: "auto",
            bottom: "auto",
            left: "auto",
            right: "auto",
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <LogOut size={17} /> Гарах
        </button>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}