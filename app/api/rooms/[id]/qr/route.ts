import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getDb, objectId } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = objectId((await params).id);
    if (!id)
      return NextResponse.json({ error: "ID буруу байна." }, { status: 400 });
    const room = await (await getDb()).collection("rooms").findOne({ _id: id });
    if (!room)
      return NextResponse.json({ error: "Өрөө олдсонгүй." }, { status: 404 });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl)
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL тохируулагдаагүй байна." },
        { status: 500 },
      );
    const png = await QRCode.toBuffer(
      `${baseUrl.replace(/\/$/, "")}/feedback/room/${room.roomNumber}`,
      { type: "png", width: 1200, margin: 4, errorCorrectionLevel: "H" },
    );
    return new NextResponse(png as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="ginza-room-${room.roomNumber}.png"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "QR үүсгэж чадсангүй." },
      { status: 500 },
    );
  }
}
