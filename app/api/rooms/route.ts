import { NextResponse } from "next/server";
import { getDb, serialize } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const db = await getDb();

        const rooms = await db
            .collection("rooms")
            .find({})
            .sort({ roomNumber: 1 })
            .toArray();

        const questions = await db
            .collection("questions")
            .find({})
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json({
            success: true,
            database: db.databaseName,
            roomsCount: rooms.length,
            questionsCount: questions.length,
            rooms: rooms.map(room => serialize(room as typeof room & { _id: import("mongodb").ObjectId })),
            questions,
        });
    } catch {
        return NextResponse.json({ success: false, error: "Өрөөнүүдийг ачаалж чадсангүй." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const body = await request.json();
        const roomNumber = Number(body.roomNumber);
        const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 100) : `Өрөө ${roomNumber}`;
        if (!Number.isInteger(roomNumber) || roomNumber < 1 || roomNumber > 999) return NextResponse.json({ error: "Өрөөний дугаар буруу байна." }, { status: 400 });
        const db = await getDb();
        if (await db.collection("rooms").findOne({ roomNumber })) return NextResponse.json({ error: "Энэ өрөө бүртгэлтэй байна." }, { status: 409 });
        const now = new Date();
        const result = await db.collection("rooms").insertOne({ roomNumber, name, slug: `room-${roomNumber}`, isActive: true, createdAt: now, updatedAt: now });
        return NextResponse.json({ room: { id: result.insertedId.toString(), roomNumber, name, slug: `room-${roomNumber}`, isActive: true, createdAt: now, updatedAt: now } }, { status: 201 });
    } catch (error) { if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 }); return NextResponse.json({ error: "Өрөө хадгалж чадсангүй." }, { status: 500 }); }
}