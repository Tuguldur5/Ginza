import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
export async function POST() { try { await destroySession(); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Гарах үед алдаа гарлаа." }, { status: 500 }); } }