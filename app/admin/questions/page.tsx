 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Q={id:string;text:string;type:"rating"|"text"|"textarea";required:boolean;active:boolean};

export default function Questions(){
 const [qs,setQs]=useState<Q[]>([]); const [text,setText]=useState(""); const [type,setType]=useState<Q["type"]>("textarea"); const [required,setRequired]=useState(false);
 const load=()=>fetch("/api/questions").then(r=>r.json()).then(d=>setQs(d.questions||[])); useEffect(()=>{load()},[]);
 const add=async()=>{if(!text.trim())return;await fetch("/api/questions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,type,required,active:true})});setText("");setRequired(false);load()};
 const toggle=async(q:Q)=>{await fetch("/api/questions",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...q,active:!q.active})});load()};
 const remove=async(id:string)=>{if(confirm("Энэ асуултыг устгах уу?")){await fetch("/api/questions",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});load()}};
 return <div className="admin-shell"><div className="topbar"><div className="topbar-inner"><div className="brand"><div className="brand-mark">G</div> Ginza Karaoke <span className="tag tag-gray">ADMIN</span></div><Link href="/admin" className="btn btn-soft" style={{textDecoration:"none"}}>← Dashboard</Link></div></div>
 <div className="admin-grid"><aside className="card side"><Link className="nav-item" href="/admin">Хяналтын самбар</Link><Link className="nav-item active" href="/admin/questions">Асуултууд удирдах</Link></aside>
 <section><h1 style={{marginTop:0}}>Асуулт удирдах</h1><p className="muted">Энд өөрчлөлт хийхэд хэрэглэгчийн feedback form автоматаар шинэчлэгдэнэ.</p>
 <div className="card form-card" style={{marginTop:18}}><h3 style={{marginTop:0}}>Шинэ асуулт нэмэх</h3><textarea className="textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Жишээ: Үйлчилгээний аль хэсэг танд хамгийн их таалагдсан бэ?"/><div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}><select className="input" style={{width:190}} value={type} onChange={e=>setType(e.target.value as Q["type"])}><option value="rating">1–5 үнэлгээ</option><option value="text">Богино текст</option><option value="textarea">Дэлгэрэнгүй текст</option></select><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={required} onChange={e=>setRequired(e.target.checked)}/> Заавал бөглөх</label><button className="btn btn-primary" onClick={add}>Асуулт нэмэх</button></div></div>
 <div className="card" style={{marginTop:18,padding:20}}><h3 style={{marginTop:0}}>Одоогийн асуултууд</h3>{qs.map((q,i)=><div key={q.id} style={{padding:"17px 0",borderBottom:"1px solid #edf0f4"}}><div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"flex-start"}}><div><div style={{fontWeight:600,lineHeight:1.5}}>{i+1}. {q.text}</div><div className="muted" style={{fontSize:12,marginTop:6}}>{q.type} · {q.required?"Заавал":"Сонголттой"}</div></div><span className={`tag ${q.active?"tag-green":"tag-gray"}`}>{q.active?"Идэвхтэй":"Идэвхгүй"}</span></div><div style={{display:"flex",gap:8,marginTop:12}}><button className="btn btn-soft" onClick={()=>toggle(q)}>{q.active?"Идэвхгүй болгох":"Идэвхжүүлэх"}</button><button className="btn btn-soft" onClick={()=>remove(q.id)}>Устгах</button></div></div>)}</div>
 </section></div></div>
}