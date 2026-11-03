"use client";
import { useState, useEffect } from "react";

const TIERS = [
  { id: "Overall", label: "Overall", icon: "/icons/overall.png" },
  { id: "Vanilla", label: "Vanilla", icon: "/icons/vanilla.png" },
  { id: "UHC", label: "UHC", icon: "/icons/uhc.png" },
  { id: "Pot", label: "Pot", icon: "/icons/pot.png" },
  { id: "NethPot", label: "NethPot", icon: "/icons/nethpot.png" },
  { id: "SMP", label: "SMP", icon: "/icons/smp.png" },
  { id: "DiaSMP", label: "DiaSMP", icon: "/icons/diasmp.png" },
  { id: "Sword", label: "Sword", icon: "/icons/sword.png" },
  { id: "Axe", label: "Axe", icon: "/icons/axe.png" },
  { id: "Mace", label: "Mace", icon: "/icons/mace.png" },
  { id: "Spear", label: "Spear", icon: "/icons/spear.png" },
];

const GAMEMODE_ORDER = ["vanilla","uhc","pot","nethpot","smp","diasmp","sword","axe","mace","spear"];
const GAMEMODE_ICONS: any = {
  vanilla: "/icons/vanilla.png", uhc: "/icons/uhc.png", pot: "/icons/pot.png",
  nethpot: "/icons/nethpot.png", smp: "/icons/smp.png", diasmp: "/icons/diasmp.png",
  sword: "/icons/sword.png", axe: "/icons/axe.png", mace: "/icons/mace.png", spear: "/icons/spear.png",
};

const ACHIEVEMENT_TITLES = [
  { name: "Combat Grandmaster", min: 400, color: "text-yellow-300", bg: "bg-[#2a2210]", border: "border-yellow-500/20", icon: "⬣" },
  { name: "Combat Master", min: 250, color: "text-[#fbbf24]", bg: "bg-[#2a2210]", border: "border-[#fbbf24]/20", icon: "⬣" },
  { name: "Combat Ace", min: 100, color: "text-red-300", bg: "bg-red-500/10", border: "border-red-400/20", icon: "⬣" },
  { name: "Combat Specialist", min: 50, color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-400/20", icon: "⬣" },
  { name: "Combat Cadet", min: 20, color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-400/20", icon: "⬣" },
  { name: "Combat Novice", min: 10, color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-400/20", icon: "⬣" },
  { name: "Rookie", min: 0, color: "text-zinc-400", bg: "bg-zinc-700/20", border: "border-zinc-600/20", icon: "⬣" },
];

function getTitleStyle(points: number){
  for(const t of ACHIEVEMENT_TITLES){ if(points >= t.min) return t; }
  return ACHIEVEMENT_TITLES[ACHIEVEMENT_TITLES.length-1];
}
function getTierForMode(tiers:any, gm:string){
  if(!tiers) return null;
  if(gm === "vanilla") return tiers.vanilla || tiers.cpvp || null;
  return tiers[gm] || null;
}
function getRankStyle(rank: number){
  if(rank === 1) return "bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]";
  if(rank === 2) return "bg-[#C0C0C0] text-black shadow-[0_0_12px_rgba(192,192,192,0.6)]";
  if(rank === 3) return "bg-[#CD7F32] text-white shadow-[0_0_12px_rgba(205,127,50,0.6)]";
  return "bg-[#1e2535] text-zinc-400";
}

export default function Home() {
  const [activeTier, setActiveTier] = useState("Overall");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [infoTab, setInfoTab] = useState<"Titles"|"Points">("Titles");

  useEffect(() => {
    const load = () => {
      fetch('/api/leaderboard/syncall').then(r=>r.json()).then(d=>{
        if(Array.isArray(d)){
          const clean = d.filter((p:any)=>p.ign && p.ign.trim()!=="").map((p:any)=>{
            if(p.tiers?.cpvp && !p.tiers?.vanilla) p.tiers.vanilla = p.tiers.cpvp;
            return p;
          });
          setPlayers(clean.sort((a,b)=>b.points-a.points));
        }
      });
    };
    load();
    const id=setInterval(load,5000);
    return ()=>clearInterval(id);
  }, []);

  const filtered = players.filter((p:any)=>{
    if(search && !p.ign?.toLowerCase().includes(search.toLowerCase())) return false;
    if(activeTier==="Overall") return true;
    const key=activeTier.toLowerCase();
    if(key==="vanilla") return p.tiers?.vanilla || p.tiers?.cpvp;
    return p.tiers?.[key];
  });

  return (
    <main className="min-h-screen bg-[#0a0e17] text-white">
      <div className="max-w-[1300px] mx-auto px-4 pt-4">
        <nav className="bg-[#151a25]/90 rounded-2xl border border-[#222836] px-6 py-3 flex justify-between items-center">
          <h1 className="font-black text-[26px] flex gap-2.5 items-center">
            <img src="/logo.png" className="w-9 h-9"/>
            <span className="flex"><span style={{color:'#00e5ff', fontWeight: 900}}>LEGACY</span><span style={{color:'#fbbf24', fontWeight: 900}}>TIERS</span></span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-[#0e121a] border border-[#222836] rounded-full px-4 py-1.5 flex gap-2"><span className="text-zinc-500 text-sm">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player..." className="bg-transparent outline-none text-sm w-[140px]"/></div>
            <a href="https://discord.gg/qHhWScQVCe" target="_blank" className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">D</a>
          </div>
        </nav>

        <div className="mt-5">
          <div className="flex gap-1.5 overflow-x-auto">
            {TIERS.map(t=>{
              const isActive = activeTier===t.id;
              return(<button key={t.id} onClick={()=>setActiveTier(t.id)} className={`flex flex-col items-center min-w-[88px] px-3 py-2.5 rounded-t-xl border-t border-x font-bold text-[12px] ${isActive ? 'bg-[#1e2535] border-[#2a344d] text-white z-10 -mb-[1px] pb-3' : 'bg-[#151a25] border-[#151a25] text-zinc-400 hover:bg-[#1c2333]'}`}><img src={t.icon} className="w-5 h-5 mb-1"/><span>{t.label}</span></button>)
            })}
          </div>

          <div className="bg-[#1a2030] border border-[#2a344d] rounded-xl rounded-tl-none p-2.5 pt-3">
            <div className="flex justify-end px-1 pb-3"><button onClick={()=>{setInfoTab("Titles"); setShowInfo(true);}} className="bg-[#252e42] border border-[#2a344d] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"><span className="w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px]">i</span> Information</button></div>
            <div className="hidden md:flex text-[11px] font-black text-zinc-500 px-3 py-1"><span className="w-16">#</span><span className="flex-1">PLAYER</span><span className="w-20 text-center">REGION</span><span className="w-[350px] text-center">TIERS</span></div>
            <div className="space-y-2">
              {filtered.map((p:any,idx:number)=>{
                const rank=idx+1;
                const titleStyle = getTitleStyle(p.points||0);
                return(
                  <div key={p.discordId} onClick={()=>setSelected(p)} className="bg-[#151a25] border border-[#2a344d] rounded-xl flex items-center px-2 py-2 cursor-pointer hover:bg-[#1e2535]">
                    <div className={`w-14 h-14 flex items-center justify-center font-black italic text-xl rounded-lg ${getRankStyle(rank)}`} style={{clipPath:"polygon(0 0, 85% 0, 100% 100%, 0 100%)"}}>{rank}.</div>
                    <img src={`https://mc-heads.net/avatar/${p.ign}/100`} className="w-11 h-11 ml-2 rounded"/><div className="ml-3 flex flex-col"><span className="font-extrabold text-[14px]">{p.ign}</span><span className={`text-[11px] font-bold ${titleStyle.color}`}>⬦ {titleStyle.name} ({p.points||0})</span></div>
                    <div className="ml-auto md:ml-0 md:w-20 flex justify-center"><span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-[#1e2535] text-zinc-300">{p.region||"ME"}</span></div>
                    <div className="hidden md:flex gap-1 ml-4 mr-1 w-[350px] justify-end">{GAMEMODE_ORDER.map(gm=>{const tier=getTierForMode(p.tiers,gm); if(!tier) return <div key={gm} className="w-8"/>; return(<div key={gm} className="flex flex-col items-center w-8"><img src={GAMEMODE_ICONS[gm]} className="w-5 h-5"/><span className="text-[9px] font-black mt-1 px-1 py-0.5 rounded bg-[#101522] text-amber-300">{tier}</span></div>)})}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PLAYER CARD MODAL - EXACT LIKE YOUR SCREENSHOT */}
      {selected && (() => {
        const titleStyle = getTitleStyle(selected.points||0);
        const selRank = players.findIndex((p:any)=>p.discordId===selected.discordId)+1;
        const selRankStyle = getRankStyle(selRank);
        const tiers = {...selected.tiers};
        if(tiers.cpvp){ if(!tiers.vanilla) tiers.vanilla=tiers.cpvp; delete tiers.cpvp; }

        return (
        <div onClick={()=>setSelected(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div onClick={e=>e.stopPropagation()} className="bg-[#121826] border border-[#1e2535] rounded-[22px] w-full max-w-[420px] p-0 relative overflow-hidden">
            {/* Close */}
            <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-10 h-10 bg-[#1e2535] hover:bg-[#252e42] rounded-full flex items-center justify-center text-xl z-20">✕</button>
            
            <div className="flex flex-col items-center pt-10 pb-6 px-6">
              {/* Avatar with gold border */}
              <div className="w-[112px] h-[112px] rounded-full border-[2px] border-[#fbbf24] p-[3px] bg-[#0e121a] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <img src={`https://mc-heads.net/avatar/${selected.ign}/100`} className="w-full h-full rounded-full object-cover bg-[#1a2030]" />
              </div>

              <h2 className="text-[28px] font-black mt-4 tracking-tight text-[#dbeafe]">{selected.ign}</h2>

              {/* Combat Master Badge */}
              <div className={`mt-3 ${titleStyle.bg} border ${titleStyle.border} px-5 py-2 rounded-full flex items-center gap-2 shadow-[0_0_12px_rgba(251,191,36,0.15)]`}>
                <span className="text-[#fbbf24] text-[20px]">⬣</span>
                <span className="text-[#fbbf24] text-[15px] font-bold">{titleStyle.name}</span>
              </div>

              <p className="text-[#2a344d] font-bold text-[16px] mt-3 tracking-wide">{selected.region==="ME"?"Middle East":selected.region==="EU"?"Europe":selected.region==="AS"?"Asia":"North America"}</p>

              {/* POSITION */}
              <div className="w-full mt-8 text-left">
                <h3 className="text-[#5a647a] font-black text-[20px] tracking-wide mb-3">POSITION</h3>
                <div className="bg-[#151a25] border border-[#1e2535] rounded-xl flex items-center overflow-hidden h-[52px]">
                  <div className={`w-[78px] h-full flex items-center justify-center font-black italic text-[30px] ${selRankStyle}`} style={{clipPath:"polygon(0 0, 75% 0, 100% 100%, 0 100%)"}}>{selRank}.</div>
                  <div className="flex items-center gap-2.5 ml-4">
                    <span className="text-[#fbbf24] text-[22px]">🏆</span>
                    <span className="font-black text-[18px] tracking-wide">OVERALL</span>
                    <span className="text-zinc-500 font-bold text-[15px]">({selected.points||0} points)</span>
                  </div>
                </div>
              </div>

              {/* TIERS */}
              <div className="w-full mt-7 text-left">
                <h3 className="text-[#5a647a] font-black text-[20px] tracking-wide mb-3">TIERS</h3>
                <div className="bg-[#151a25] border border-[#1e2535] rounded-xl p-3">
                  <div className="flex justify-between gap-1">
                    {GAMEMODE_ORDER.map(gm=>{
                      const tier = tiers[gm];
                      if(!tier) return <div key={gm} className="flex-1"/>;
                      const isHT = tier.startsWith("HT");
                      return(
                        <div key={gm} className="flex flex-col items-center flex-1">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-[#0e121a] border ${isHT ? 'border-amber-500/30' : 'border-zinc-700/50'}`}>
                            <img src={GAMEMODE_ICONS[gm]} className="w-5 h-5"/>
                          </div>
                          <span className={`text-[11px] font-black mt-1.5 px-2 py-0.5 rounded-full ${isHT ? 'bg-[#2a1f0a] text-[#fbbf24] border border-amber-500/20' : 'bg-[#1e2535] text-zinc-400'}`} style={{fontWeight:900}}>{tier}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

      {showInfo && (
        <div onClick={()=>setShowInfo(false)} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-20">
          <div onClick={e=>e.stopPropagation()} className="bg-[#111521] border border-[#1e2535] rounded-2xl w-full max-w-[380px] overflow-hidden">
            <div className="p-2"><div className="bg-[#1a2030] rounded-full p-1 flex"><button onClick={()=>setInfoTab("Titles")} className={`flex-1 py-2 rounded-full text-sm font-bold ${infoTab==="Titles"?"bg-[#252e42] text-white":"text-zinc-500"}`}>Titles</button><button onClick={()=>setInfoTab("Points")} className={`flex-1 py-2 rounded-full text-sm font-bold ${infoTab==="Points"?"bg-[#252e42] text-white":"text-zinc-500"}`}>Points</button></div></div>
            <div className="px-6 pb-6 pt-2">{/* ... titles/points content same ... */}</div>
          </div>
        </div>
      )}
    </main>
  );
}