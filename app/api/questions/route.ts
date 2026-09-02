import { NextResponse } from "next/server";
import { getDb, objectId, QuestionType, serialize } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

const validTypes: QuestionType[] = ["rating", "text", "textarea"];
const cleanText = (value: unknown, max = 1000) => typeof value === "string" ? value.replace(/[<>]/g, "").trim().slice(0, max) : "";

export async function GET(req: Request) {
  try {
    const all = new URL(req.url).searchParams.get("all") === "1";
    if (all) await requireAdmin();
    const questions = await (await getDb()).collection("questions").find(all ? {} : { isActive: true }).sort({ order: 1 }).toArray();
    return NextResponse.json({ questions: questions.map(q => serialize(q as typeof questions[number] & { _id: import("mongodb").ObjectId })) });
  } catch { return NextResponse.json({ error: "Асуултуудыг ачаалж чадсангүй." }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json(); const text = cleanText(body.text);
    if (!validTypes.includes(body.type) || !text) return NextResponse.json({ error: "Асуултын мэдээлэл буруу байна." }, { status: 400 });
    const db = await getDb(); const now = new Date().toISOString();
    const order = await db.collection("questions").countDocuments();
    const result = await db.collection("questions").insertOne({ type: body.type, text, required: body.required === true, order, isActive: body.isActive !== false, createdAt: now, updatedAt: now });
    return NextResponse.json({ question: { id: result.insertedId.toString(), type: body.type, text, required: body.required === true, order, isActive: body.isActive !== false, createdAt: now, updatedAt: now } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Асуултыг хадгалж чадсангүй." }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json(); const id = typeof body.id === "string" ? objectId(body.id) : null;
    if (!id) return NextResponse.json({ error: "ID буруу байна." }, { status: 400 });
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.text !== undefined) { const text = cleanText(body.text); if (!text) return NextResponse.json({ error: "Асуулт хоосон байна." }, { status: 400 }); update.text = text; }
    if (body.type !== undefined && validTypes.includes(body.type)) update.type = body.type; else if (body.type !== undefined) return NextResponse.json({ error: "Асуултын төрөл буруу байна." }, { status: 400 });
    if (body.required !== undefined) update.required = body.required === true;
    if (body.isActive !== undefined) update.isActive = body.isActive === true;
    if (body.order !== undefined && Number.isInteger(body.order) && body.order >= 0) update.order = body.order;
    const result = await (await getDb()).collection("questions").findOneAndUpdate({ _id: id }, { $set: update }, { returnDocument: "after" });
    if (!result) return NextResponse.json({ error: "Асуулт олдсонгүй." }, { status: 404 });
    return NextResponse.json({ question: serialize(result as typeof result & { _id: import("mongodb").ObjectId }) });
  } catch { return NextResponse.json({ error: "Асуултыг шинэчилж чадсангүй." }, { status: 500 }); }
}
export const PUT = PATCH;

export async function DELETE(req: Request) {
  try { await requireAdmin(); const body = await req.json(); const id = typeof body.id === "string" ? objectId(body.id) : null; if (!id) return NextResponse.json({ error: "ID буруу байна." }, { status: 400 }); const result = await (await getDb()).collection("questions").deleteOne({ _id: id }); return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Асуулт олдсонгүй." }, { status: 404 }); }
  catch { return NextResponse.json({ error: "Асуултыг устгаж чадсангүй." }, { status: 500 }); }
}