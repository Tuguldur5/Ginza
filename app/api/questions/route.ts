import { NextResponse } from "next/server";
import { getQuestions, saveQuestion, deleteQuestion, Question } from "@/lib/store";

export async function GET(){ return NextResponse.json({questions:getQuestions(true)}); }

export async function POST(req:Request){
  const body=await req.json();
  const q:Question={id:body.id||`q_${Date.now()}`,type:body.type||"textarea",text:String(body.text||""),required:Boolean(body.required),active:body.active!==false};
  if(!q.text.trim()) return NextResponse.json({error:"Асуулт хоосон байна."},{status:400});
  return NextResponse.json({question:saveQuestion(q)});
}

export async function PUT(req:Request){
  const body=await req.json();
  if(!body.id) return NextResponse.json({error:"ID шаардлагатай."},{status:400});
  const existing=getQuestions(false).find(q=>q.id===body.id);
  if(!existing) return NextResponse.json({error:"Асуулт олдсонгүй."},{status:404});
  return NextResponse.json({question:saveQuestion({...existing,...body})});
}

export async function DELETE(req:Request){
  const {id}=await req.json(); if(!id)return NextResponse.json({error:"ID шаардлагатай."},{status:400});
  deleteQuestion(id); return NextResponse.json({ok:true});
}