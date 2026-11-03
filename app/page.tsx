"use client";
import { useState, useEffect } from "react";

const TIERS = [
  { id: "Overall", label: "Overall", icon: "/icons/overall.png", emoji: "🏆" },
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
  { name: "Combat Grandmaster", min: 400, color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/40", glow: "shadow-[0_0_15px_rgba(250,204,21,0.5)]" },
  { name: "Combat Master", min: 250, color: "text-amber-200", bg: "bg-amber-500/15", border: "border-amber-400/30", glow: "shadow-[0_0_12px_rgba(251,191,36,0.4)]" },
  { name: "Combat Ace", min: 100, color: "text-red-300", bg: "bg-red-500/15", border: "border-red-400/30", glow: "shadow-[0_0_12px_rgba(252,165,165,0.4)]" },
  { name: "Combat Specialist", min: 50, color: "text-purple-300", bg: "bg-purple-500/15", border: "border-purple-400/30", glow: "shadow-[0_0_12px_rgba(216,180,254,0.4)]" },
  { name: "Combat Cadet", min: 20, color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-400/30", glow: "shadow-[0_0_12px_rgba(147,197,253,0.4)]" },
  { name: "Combat Novice", min: 10, color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-400/30", glow: "shadow-[0_0_12px_rgba(196,181,253,0.4)]" },
  { name: "Rookie", min: 0, color: "text-zinc-400", bg: "bg-zinc-700/20", border: "border-zinc-600/30", glow: "" },
];

const RANKING_POINTS = [
  { tier: "Tier 1", icon: "🏆", color: "text-yellow-500", ht: 60, lt: 45 },
  { tier: "Tier 2", icon: "🏆", color: "text-zinc-300", ht: 30, lt: 20 },
  { tier: "Tier 3", icon: "🏆", color: "text-amber-600", ht: 10, lt: 6 },
  { tier: "Tier 4", icon: "", color: "text-zinc-400", ht: 4, lt: 3 },
  { tier: "Tier 5", icon: "", color: "text-zinc-500", ht: 2, lt: 1 },
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
        {/* TOP NAV - LOGO ONLY */}
        <nav className="bg-[#151a25]/90 rounded-2xl border border-[#222836] px-6 py-3 flex justify-between items-center">
          <h1 className="font-black text-[26px] tracking-tight flex gap-2.5 items-center" style={{fontFamily:'Inter, monospace', fontWeight: 900}}>
            <img src="/logo.png" className="w-9 h-9"/>
            <span className="flex">
              <span style={{color:'#00e5ff', fontWeight: 900, textShadow:'0 0 10px rgba(0,229,255,1), 0 0 20px rgba(0,229,255,0.8)'}}>LEGACY</span>
              <span style={{color:'#fbbf24', fontWeight: 900, textShadow:'0 0 10px rgba(251,191,36,1), 0 0 20px rgba(251,191,36,0.8)'}}>TIERS</span>
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-[#0e121a] border border-[#222836] rounded-full px-4 py-1.5 flex gap-2"><span className="text-zinc-500 text-sm">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player..." className="bg-transparent outline-none text-sm w-[140px]"/></div>
            <a href="https://discord.gg/qHhWScQVCe" target="_blank" className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </a>
          </div>
        </nav>

        {/* ATTACHED TABS + PLAYERS - SINGLE CARD LIKE SCREENSHOT */}
        <div className="mt-5">
          {/* Gamemode Tabs - attached to top */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TIERS.map(t=>{
              const isActive = activeTier===t.id;
              return(
                <button 
                  key={t.id} 
                  onClick={()=>setActiveTier(t.id)} 
                  className={`flex flex-col items-center justify-center min-w-[92px] px-3 py-2.5 rounded-t-xl border-t border-x text-[12px] font-bold transition-all
                  ${isActive 
                    ? 'bg-[#151a25] border-[#222836] border-b-0 text-white relative z-10 -mb-[1px] pb-[13px]' 
                    : 'bg-[#0e121a] border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#151a25]/60 mt-1'}`}
                >
                  <span className={`text-[18px] ${isActive ? '' : 'grayscale opacity-60'}`}>{t.id==="Overall" ? "🏆" : ""}</span>
                  {t.id!=="Overall" && <img src={t.icon} className={`w-5 h-5 ${isActive ? '' : 'grayscale opacity-60'}`}/>}
                  <span className="mt-1">{t.label}</span>
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"/>}
                </button>
              )
            })}
          </div>

          {/* Main Players Card - attached */}
          <div className="bg-[#151a25] border border-[#222836] rounded-xl rounded-tl-none p-2 pt-3">
            {/* Card Header - Info + Server IP like screenshot */}
            <div className="flex justify-end items-center gap-2 px-2 pb-3">
              <button onClick={()=>{setInfoTab("Titles"); setShowInfo(true);}} className="bg-[#1e2535] border border-[#2a344d] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black">i</span> Information
              </button>
              <div className="hidden md:flex items-center gap-2 bg-[#0e121a] border border-[#222836] rounded-lg px-3 py-1.5">
                <span className="bg-[#ff2d2d] text-white text-[10px] font-black px-1.5 py-0.5 rounded">PVP CLUB</span>
                <span className="text-xs text-zinc-400">SERVER IP</span>
                <span className="text-xs font-bold">mcpvp.club</span>
              </div>
            </div>

            {/* Column Headers */}
            <div className="hidden md:flex text-[11px] font-black text-zinc-600 px-3 py-2">
              <span className="w-16 text-center">#</span>
              <span className="flex-1 ml-3">PLAYER</span>
              <span className="w-20 text-center">REGION</span>
              <span className="w-[340px] text-center">TIERS</span>
            </div>

            {/* Players List */}
            <div className="space-y-2">
              {filtered.map((p:any,idx:number)=>{
                const rank=idx+1;
                const titleStyle = getTitleStyle(p.points||0);
                const rankStyle = getRankStyle(rank);
                return(
                  <div key={p.discordId} onClick={()=>setSelected(p)} className="bg-[#0e121a] border border-[#1e2535] rounded-xl flex items-center px-2 py-2 cursor-pointer hover:bg-[#1a2132] transition">
                    <div className={`w-14 h-14 flex items-center justify-center font-black italic text-xl rounded-l-lg ${rankStyle}`} style={{clipPath:"polygon(0 0, 80% 0, 100% 100%, 0 100%)"}}>{rank}.</div>
                    <img src={`https://mc-heads.net/avatar/${p.ign}/100`} className="w-11 h-11 ml-2 rounded"/>
                    <div className="ml-3 flex flex-col">
                      <span className="font-extrabold text-[14px]">{p.ign}</span>
                      <span className={`text-[11px] font-bold ${titleStyle.color}`}>⬦ {titleStyle.name} ({p.points||0})</span>
                    </div>
                    <div className="ml-auto md:ml-0 md:w-20 flex justify-center"><span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${p.region==="NA" ? "bg-red-500/20 text-red-400" : p.region==="EU" ? "bg-green-500/20 text-green-400" : "bg-zinc-700/30 text-zinc-400"}`}>{p.region||"ME"}</span></div>
                    <div className="hidden md:flex gap-1.5 ml-4 mr-1 w-[340px] justify-end">
                      {GAMEMODE_ORDER.map(gm=>{
                        const tier=getTierForMode(p.tiers,gm);
                        if(!tier) return <div key={gm} className="w-8"/>;
                        return(
                          <div key={gm} className="flex flex-col items-center w-8">
                            <img src={GAMEMODE_ICONS[gm]} className="w-5 h-5 opacity-80"/>
                            <span className="text-[9px] font-black mt-1 px-1 py-0.5 rounded bg-[#1a1e29] text-amber-300 border border-amber-900/30">{tier}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Modal + Info Modal - same as before */}
      {selected && (() => {
        const titleStyle = getTitleStyle(selected.points||0);
        const selRank = players.findIndex((p:any)=>p.discordId===selected.discordId)+1;
        const selRankStyle = getRankStyle(selRank);
        return (
        <div onClick={()=>setSelected(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div onClick={e=>e.stopPropagation()} className="bg-[#101522] border border-[#1e2535] rounded-[20px] w-full max-w-[400px] p-6 relative">
            <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-10 h-10 bg-[#1e2535] rounded-full flex items-center justify-center">✕</button>
            <div className="flex flex-col items-center mt-2">
              <div className="w-[88px] h-[88px] rounded-full border-2 p-1"><img src={`https://mc-heads.net/avatar/${selected.ign}/100`} className="w-full h-full rounded-full bg-[#0e121a]" /></div>
              <h2 className="text-[26px] font-black mt-3">{selected.ign}</h2>
              <div className={`mt-2 ${titleStyle.bg} ${titleStyle.border} border px-4 py-1.5 rounded-full flex items-center gap-2`}><span className={titleStyle.color}>⬣</span><span className={`${titleStyle.color} text-sm font-bold`}>{titleStyle.name}</span></div>
              <p className="text-[#2a344d] font-black text-[17px] mt-3">{selected.region==="ME"?"Middle East":"North America"}</p>
            </div>
            <div className="mt-8">
              <h3 className="text-zinc-500 font-black text-[20px] mb-3">POSITION</h3>
              <div className="bg-[#151a25] border border-[#222836] rounded-xl flex items-center overflow-hidden">
                <div className={`font-black italic text-[28px] px-5 py-2.5 ${selRankStyle}`} style={{clipPath:"polygon(0 0, 80% 0, 100% 100%, 0 100%)"}}>{selRank}.</div>
                <div className="flex items-center gap-2 ml-4"><span className="text-[#fbbf24] text-xl">🏆</span><span className="font-black">OVERALL</span><span className="text-zinc-500 font-bold">({selected.points||0} points)</span></div>
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
            <div className="px-6 pb-6 pt-2">
              {infoTab==="Titles" ? (
                <><h3 className="font-bold text-[16px] mb-4">How to obtain <span className="underline">Achievement Titles</span></h3><div className="space-y-4">{ACHIEVEMENT_TITLES.map(t=><div key={t.name}><div className={`flex items-center gap-2 font-bold ${t.color}`}><span>⬣</span> {t.name}</div><div className="text-zinc-500 text-[13px] ml-6">Obtained {t.min}+ total points.</div></div>)}</div></>
              ) : (
                <><h3 className="font-bold text-[16px] mb-5">How <span className="underline">ranking points</span> are calculated</h3><div className="space-y-5">{RANKING_POINTS.map(r=><div key={r.tier}><div className={`flex items-center gap-2 font-bold mb-2 ${r.color}`}>{r.icon && <span>{r.icon}</span>} {r.tier}</div><div className="flex gap-2 ml-1 border-l-2 border-zinc-800 pl-3"><div className="bg-[#2a2f3a] px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold"><span className="text-zinc-400">⌃</span> {r.lt} Points</div><div className="bg-[#2a2f3a] px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold"><span className="text-zinc-400">⌃⌃</span> {r.ht} Points</div></div></div>)}<div className="mt-2 text-[11px] text-zinc-600">⌃ = Low Tier (LT) • ⌃⌃ = High Tier (HT)</div></div></>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}