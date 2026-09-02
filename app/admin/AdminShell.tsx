"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  DoorOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  ["/admin", "Хянах самбар", LayoutDashboard],
  ["/admin/feedback", "Санал хүсэлт", FileText],
  ["/admin/questions", "Асуултууд", ClipboardList],
  ["/admin/rooms", "Өрөөнүүд", DoorOpen],
  ["/admin/qr", "QR код", QrCode],
  ["/admin/analytics", "Шинжилгээ", BarChart3],
  ["/admin/users", "Хэрэглэгчид", Users],
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
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };
  if (isLogin) return <>{children}</>;
  return (
    <div className="admin-shell" style={{ "--admin-ui-scale": uiScale } as React.CSSProperties}>
      <button
        className="mobile-menu"
        aria-label="Цэс нээх"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>
      {open && (
        <button
          className="drawer-backdrop"
          aria-label="Цэс хаах"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
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
            className="drawer-close"
            aria-label="Цэс хаах"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav>
          {navigation.map(([href, label, Icon]) => (
            <Link
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              className={
                pathname === href ||
                (href !== "/admin" && pathname.startsWith(href))
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <Link className="nav-item settings-link" href="/admin/settings">
          <Settings size={18} />
          <span>Тохиргоо</span>
        </Link>
        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={17} /> Гарах
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
