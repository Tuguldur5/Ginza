 "use client";

import { useEffect, useState } from "react";

type Question = { id:string; type:"rating"|"text"|"textarea"; text:string; required:boolean; active:boolean };

export default function FeedbackPage() {
  const [questions,setQuestions]=useState<Question[]>([]);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [table,setTable]=useState("1");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setTable(p.get("table")||"1");
    fetch("/api/questions").then(r=>r.json()).then(d=>setQuestions(d.questions||[])).catch(()=>setError("Асуултуудыг ачаалж чадсангүй.")).finally(()=>setLoading(false));
  },[]);

  const submit=async()=>{
    setError("");
    for(const q of questions){
      if(q.required && !answers[q.id]) { setError("Заавал бөглөх талбаруудыг бүрэн бөглөнө үү."); return; }
    }
    setSending(true);
    try{
      const res=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({table,answers})});
      if(!res.ok) throw new Error();
      setDone(true);
    }catch{setError("Санал илгээх үед алдаа гарлаа. Дахин оролдоно уу.");}
    finally{setSending(false)}
  };

  if(loading) return <main className="container" style={{padding:"80px 0",textAlign:"center"}}>Уншиж байна...</main>;

  if(done) return <main className="container" style={{padding:"70px 0"}}><div className="card success"><div className="success-icon">✓</div><h1 style={{marginBottom:8}}>Баярлалаа!</h1><p className="muted">Таны санал, сэтгэгдлийг Ginza Karaoke хүлээн авлаа.</p><button className="btn btn-soft" style={{marginTop:18}} onClick={()=>{setDone(false);setAnswers({})}}>Дахин санал өгөх</button></div></main>;

  return <main className="container">
    <section className="hero">
      <div className="hero-card">
        <div className="hero-art">
          <div>
            <div className="tag tag-gray">GINZA KARAOKE · УЛААНБААТАР</div>
            <h1 style={{fontSize:"clamp(28px,5vw,44px)",margin:"12px 0 8px",letterSpacing:"-.03em"}}>Таны санал бидэнд чухал.</h1>
            <p className="muted" style={{maxWidth:650,lineHeight:1.7}}>Үйлчилгээгээ улам сайжруулахын тулд хэдхэн асуултад хариулна уу.</p>
          </div>
        </div>
      </div>
    </section>
    <section className="card form-card" style={{marginBottom:50}}>
      <div style={{marginBottom:18}}>
        <div className="tag tag-green">Ширээ №{table}</div>
        <h2 style={{margin:"12px 0 5px"}}>Санал хүсэлт</h2>
        <p className="muted" style={{margin:0,fontSize:14}}>Нэр, утас шаардахгүй. Таны хариултыг зөвхөн үйлчилгээ сайжруулахад ашиглана.</p>
      </div>
      {questions.map(q=><div className="question" key={q.id}>
        <div className="question-label">{q.text}{q.required&&<span style={{color:"#c2410c"}}> *</span>}</div>
        {q.type==="rating" ? <div className="stars">{[1,2,3,4,5].map(n=><button aria-label={`${n} оноо`} key={n} className={`star ${answers[q.id]===String(n)?"active":""}`} onClick={()=>setAnswers(a=>({...a,[q.id]:String(n)}))}>{n<=Number(answers[q.id]||0)?"★":"☆"}</button>)}</div>
        : <textarea className="textarea" value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} placeholder="Энд бичнэ үү..." />}
      </div>)}
      {error&&<div style={{background:"#fff3f2",color:"#b42318",padding:12,borderRadius:12,marginTop:18}}>{error}</div>}
      <button className="btn btn-primary" disabled={sending} style={{width:"100%",marginTop:22,padding:14}} onClick={submit}>{sending?"Илгээж байна...":"Санал илгээх"}</button>
    </section>
  </main>;
}