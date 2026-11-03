"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlayerPage(){
  const { ign } = useParams();
  const [p,setP] = useState<any>(null);

  useEffect(()=>{
    fetch(`/api/player/${ign}`).then(r=>r.json()).then(setP);
  },[ign]);

  if(!p) return <div className="min-h-screen bg-[#0e121a] text-white p-10">Loading {ign}...</div>;

  return (
    <main className="min-h-screen bg-[#0e121a] text-white p-6">
      <a href="/" className="text-zinc-500 text-sm">- Back to Rankings</a>
      <div className="max-w-4xl mx-auto mt-6 bg-[#151a25] rounded-2xl p-8 border border-[#222836]">
        <div className="flex gap-6 items-center">
          <img src={p.avatar ? `https://cdn.discordapp.com/avatars/${p.discordId}/${p.avatar}.png` : `https://mc-heads.net/avatar/${p.ign}/100`} className="w-24 h-24 rounded-xl" />
          <div>
            <h1 className="text-3xl font-black">{p.ign}</h1>
            <p className="text-zinc-400">{p.region} - {p.points} points - {Object.keys(p.tiers).length} tiers</p>
            <p className="mt-2 text-yellow-400">{p.points>=250?"Combat Master":p.points>=150?"Combat Ace":"Combat"}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
