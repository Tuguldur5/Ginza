import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
export async function GET() { try { const admin = await getCurrentAdmin(); return admin ? NextResponse.json({ admin }) : NextResponse.json({ admin: null }, { status: 401 }); } catch { return NextResponse.json({ admin: null }, { status: 401 }); } }