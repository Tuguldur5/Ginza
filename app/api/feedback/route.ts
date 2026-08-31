import { NextResponse } from "next/server";
import { addFeedback, getFeedback } from "@/lib/store";

export async function GET(){return NextResponse.json({feedback:getFeedback()});}
export async function POST(req:Request){
  const body=await req.json();
  if(!body.answers || typeof body.answers!=="object") return NextResponse.json({error:"Хариулт шаардлагатай."},{status:400});
  const item={id:`FB-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${Math.floor(1000+Math.random()*9000)}`,table:String(body.table||"1"),createdAt:new Date().toISOString(),answers:body.answers};
  addFeedback(item); return NextResponse.json({feedback:item});
}