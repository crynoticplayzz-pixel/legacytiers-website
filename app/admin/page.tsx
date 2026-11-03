"use client";
import { useState } from "react";

export default function Admin(){
  const [ign,setIgn]=useState(""); const [gm,setGm]=useState("sword"); const [tier,setTier]=useState("HT1"); const [secret,setSecret]=useState("");

  const submit = async()=>{
    const res = await fetch("http://localhost:3001/api/admin/set-tier",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ign,gamemode:gm,tier,secret})});
    const data = await res.json();
    alert(JSON.stringify(data));
  };

  return (
    <main className="min-h-screen bg-[#0e121a] text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="max-w-md bg-[#151a25] p-6 rounded-xl space-y-3 border border-[#222836]">
        <input value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Admin Secret (legacy123)" className="w-full bg-[#0e121a] p-2 rounded border border-[#222836]" />
        <input value={ign} onChange={e=>setIgn(e.target.value)} placeholder="IGN" className="w-full bg-[#0e121a] p-2 rounded border border-[#222836]" />
        <select value={gm} onChange={e=>setGm(e.target.value)} className="w-full bg-[#0e121a] p-2 rounded border border-[#222836]">
          <option>sword</option><option>axe</option><option>vanilla</option><option>uhc</option><option>pot</option><option>nethpot</option><option>smp</option><option>mace</option><option>spear</option>
        </select>
        <select value={tier} onChange={e=>setTier(e.target.value)} className="w-full bg-[#0e121a] p-2 rounded border border-[#222836]">
          <option>HT1</option><option>HT2</option><option>HT3</option><option>LT1</option><option>HT4</option><option>LT2</option><option>LT3</option>
        </select>
        <button onClick={submit} className="w-full bg-yellow-500 text-black font-bold py-2 rounded">Update Tier</button>
      </div>
    </main>
  )
}