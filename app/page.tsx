"use client";
import { useState, useEffect } from "react";

const TIERS = [
  { id: "Overall", label: "Overall", icon: "/icons/overall.png" },
  { id: "Vanilla", label: "Vanilla", icon: "/icons/vanilla.png" },
  { id: "UHC", label: "UHC", icon: "/icons/uhc.png" },
  { id: "Pot", label: "Pot", icon: "/icons/pot.png" },
  { id: "NethPot", label: "NethPot", icon: "/icons/nethpot.png" },
  { id: "SMP", label: "SMP", icon: "/icons/smp.png" },
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
  { name: "Combat Grandmaster", min: 400, color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
  { name: "Combat Master", min: 250, color: "text-amber-200", bg: "bg-amber-500/15", border: "border-amber-400/30" },
  { name: "Combat Ace", min: 100, color: "text-red-300", bg: "bg-red-500/15", border: "border-red-400/30" },
  { name: "Combat Specialist", min: 50, color: "text-purple-300", bg: "bg-purple-500/15", border: "border-purple-400/30" },
  { name: "Combat Cadet", min: 20, color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-400/30" },
  { name: "Combat Novice", min: 10, color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-400/30" },
  { name: "Rookie", min: 0, color: "text-zinc-400", bg: "bg-zinc-700/20", border: "border-zinc-600/30" },
];

const RANKING_POINTS = [
  { tier: "Tier 1", icon: "🏆", color: "text-yellow-400", ht: 60, lt: 45 },
  { tier: "Tier 2", icon: "🏆", color: "text-zinc-200", ht: 30, lt: 20 },
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
  if(typeof tiers === 'string'){
    try { tiers = JSON.parse(tiers); } catch{}
  }
  const key = gm.toLowerCase();
  if(key === "vanilla") return tiers.vanilla || tiers.cpvp || tiers.Vanilla || tiers.CPVP || null;
  if(key === "spear") return tiers.spear || tiers.spearmace || null;
  if(key === "mace") return tiers.mace || null;
  return tiers[key] || tiers[gm] || tiers[gm.toUpperCase()] || null;
}
function getRankStyle(rank: number){
  if(rank === 1) return "bg-[#fbbf24] text-black shadow-[0_0_20px_rgba(251,191,36,0.8)]";
  if(rank === 2) return "bg-[#C0C0C0] text-black shadow-[0_0_15px_rgba(192,192,192,0.6)]";
  if(rank === 3) return "bg-[#CD7F32] text-white shadow-[0_0_15px_rgba(205,127,50,0.6)]";
  return "bg-[#1e2535] text-zinc-400";
}
function getRegionStyle(region: string){
  if(region==="ME") return "bg-green-500/20 text-green-400 border-green-500/30";
  if(region==="AS" || region==="AU") return "bg-red-500/20 text-red-400 border-red-500/30";
  if(region==="NA") return "bg-[#3f2f0a] text-[#fbbf24] border-amber-500/30";
  if(region==="EU") return "bg-green-500/20 text-green-400 border-green-500/30";
  return "bg-zinc-700/20 text-zinc-400 border-zinc-600/30";
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
            let tiers = p.tiers;
            if(typeof tiers === 'string'){
              try { tiers = JSON.parse(tiers); } catch(e){ tiers = {}; }
            }
            if(!tiers) tiers = {};
            if(tiers.spearmace){
              if(!tiers.spear) tiers.spear = tiers.spearmace;
              delete tiers.spearmace;
            }
            if(tiers.cpvp && !tiers.vanilla) tiers.vanilla = tiers.cpvp;
            p.tiers = tiers;
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
      <div className="w-full px-3 pt-3">
        <nav className="w-full bg-[#151a25]/90 rounded-xl border border-[#1e2535] px-6 py-3.5 flex justify-between items-center max-w-[98%] mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="font-black text-[28px] flex gap-2.5 items-center">
              <img src="/logo.png" className="w-9 h-9"/>
              <span className="flex tracking-tight">
                <span style={{color:'#00e5ff', fontWeight: 900, textShadow:'0 0 8px rgba(0,229,255,1), 0 0 18px rgba(0,229,255,0.8)'}}>LEGACY</span>
                <span style={{color:'#fbbf24', fontWeight: 900, textShadow:'0 0 8px rgba(251,191,36,1), 0 0 18px rgba(251,191,36,0.8)'}}>TIERS</span>
              </span>
            </h1>
            <div className="hidden md:flex items-center gap-2 text-white font-black text-[15px] bg-[#1c2333] border border-[#2a344d] px-5 py-2 rounded-full">
              <span>🏆</span> RANKING
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#0e121a] border border-[#222836] rounded-full px-4 py-2 flex gap-2"><span className="text-zinc-500">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player..." className="bg-transparent outline-none text-sm w-[180px]"/></div>
            <a href="https://discord.gg/qHhWScQVCe" target="_blank" className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(88,101,242,0.7)]">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </a>
          </div>
        </nav>
      </div>

      <div className="w-full max-w-[98%] mx-auto px-2 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TIERS.map(t=>{
            const isActive = activeTier===t.id;
            return(
              <button key={t.id} onClick={()=>setActiveTier(t.id)} 
                className={`flex flex-col items-center min-w-[105px] px-4 py-3 rounded-xl border font-bold text-[13px] transition
                ${isActive ? 'bg-[#1e2535] border-[#2a344d] text-white shadow-lg' : 'bg-[#151a25] border-[#1e2535] text-zinc-500 hover:bg-[#1c2333] hover:text-zinc-300'}`}>
                <img src={t.icon} className="w-7 h-7 mb-1.5"/>
                <span className={isActive ? "text-white" : ""}>{t.label}</span>
                {isActive && <div className="w-full h-[3px] bg-[#fbbf24] rounded-full mt-1.5 -mb-1"/>}
              </button>
            )
          })}
        </div>

        <div className="bg-[#11161f] border border-[#1e2535] rounded-xl p-3 mt-1">
          <div className="flex justify-between items-center px-3 pb-4 pt-2">
            <div className="hidden md:flex text-[13px] font-black text-zinc-600 gap-4">
              <span className="w-[90px]">#</span><span className="w-[280px]">PLAYER</span><span className="w-[100px] text-center">REGION</span><span className="flex-1 text-right pr-10">TIERS</span>
            </div>
            <button onClick={()=>{setInfoTab("Titles"); setShowInfo(true);}} className="ml-auto bg-[#1c2333] border border-[#2a344d] px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 hover:bg-[#252e42]"><span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[11px]">i</span> Information</button>
          </div>

          <div className="space-y-2.5">
            {filtered.map((p:any,idx:number)=>{
              const rank=idx+1;
              const titleStyle = getTitleStyle(p.points||0);
              const regionStyle = getRegionStyle(p.region||"ME");
              return(
                <div key={p.discordId} onClick={()=>setSelected(p)} className="bg-[#151a25] border border-[#1e2535] rounded-xl flex items-center px-0 py-0 cursor-pointer hover:bg-[#1c2333] hover:border-[#2a344d] transition h-[78px] overflow-hidden group">
                  <div className={`w-[90px] h-full flex items-center justify-center font-black italic text-[32px] ${getRankStyle(rank)} shrink-0`} style={{clipPath:"polygon(0 0, 80% 0, 100% 100%, 0 100%)"}}>
                    {rank}.
                  </div>
                  <img src={`https://mc-heads.net/avatar/${p.ign}/100`} className="w-[52px] h-[52px] ml-3 rounded-[4px] bg-[#0e121a]"/>
                  <div className="ml-4 flex flex-col justify-center">
                    <span className="font-extrabold text-[18px] leading-tight group-hover:text-white">{p.ign}</span>
                    <span className={`text-[13px] font-bold flex items-center gap-1.5 ${titleStyle.color}`}><span>⬦</span> {titleStyle.name} <span className="text-zinc-600">({p.points||0} points)</span></span>
                  </div>
                  <div className="ml-auto md:ml-0 md:w-[100px] flex justify-center shrink-0">
                    <span className={`px-3 py-1.5 rounded-md text-[13px] font-black border min-w-[48px] text-center ${regionStyle}`}>{p.region||"NA"}</span>
                  </div>
                  <div className="hidden lg:flex gap-1.5 ml-auto mr-3 shrink-0">
                    {GAMEMODE_ORDER.map(gm=>{
                      const tier=getTierForMode(p.tiers,gm); 
                      if(!tier) return <div key={gm} className="w-[42px] h-[42px] rounded-full bg-[#0e121a] border border-[#1e2535]/50 opacity-20"/>;
                      const isHT = tier.startsWith("HT");
                      return(
                        <div key={gm} className="flex flex-col items-center w-[46px]">
                          <div className="w-[38px] h-[38px] rounded-full bg-[#0e121a] border border-[#1e2535] flex items-center justify-center">
                            <img src={GAMEMODE_ICONS[gm]} className="w-5 h-5"/>
                          </div>
                          <span className={`text-[10px] font-black mt-1 px-1.5 py-0.5 rounded-[5px] border ${isHT ? 'bg-[#3d2f0a] text-[#fbbf24] border-amber-600/30' : 'bg-[#232a36] text-zinc-400 border-zinc-600/30'}`}>{tier}</span>
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

      {selected && (() => {
        const titleStyle = getTitleStyle(selected.points||0);
        const selRank = players.findIndex((p:any)=>p.discordId===selected.discordId)+1;
        let tiers = selected.tiers;
        if(typeof tiers === 'string'){ try{ tiers = JSON.parse(tiers); } catch{} }
        if(tiers?.cpvp){ if(!tiers.vanilla) tiers.vanilla=tiers.cpvp; }
        if(tiers?.spearmace){ if(!tiers.spear) tiers.spear=tiers.spearmace; delete tiers.spearmace; }
        const regionStyle = getRegionStyle(selected.region||"ME");
        return (
        <div onClick={()=>setSelected(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div onClick={e=>e.stopPropagation()} className="bg-[#121826] border border-[#1e2535] rounded-[22px] w-full max-w-[460px] p-0 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 w-10 h-10 bg-[#1e2535] hover:bg-[#252e42] rounded-full flex items-center justify-center text-xl z-20">✕</button>
            <div className="flex flex-col items-center pt-10 pb-6 px-6">
              <div className="w-[112px] h-[112px] rounded-full border-[2px] border-[#fbbf24] p-[3px] bg-[#0e121a] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <img src={`https://mc-heads.net/avatar/${selected.ign}/100`} className="w-full h-full rounded-full object-cover bg-[#1a2030]" />
              </div>
              <h2 className="text-[28px] font-black mt-4 tracking-tight text-[#dbeafe]">{selected.ign}</h2>
              <div className={`mt-3 ${titleStyle.bg} border ${titleStyle.border} px-5 py-2 rounded-full flex items-center gap-2`}><span className="text-[#fbbf24] text-[20px]">⬣</span><span className="text-[#fbbf24] text-[15px] font-bold">{titleStyle.name}</span></div>
              <div className={`mt-3 px-3 py-1 rounded-full text-sm font-black border ${regionStyle}`}>{selected.region}</div>
              <div className="w-full mt-8 text-left">
                <h3 className="text-[#5a647a] font-black text-[20px] tracking-wide mb-3">POSITION</h3>
                <div className="bg-[#151a25] border border-[#1e2535] rounded-xl flex items-center overflow-hidden h-[52px]">
                  <div className={`w-[78px] h-full flex items-center justify-center font-black italic text-[30px] ${getRankStyle(selRank)}`} style={{clipPath:"polygon(0 0, 75% 0, 100% 100%, 0 100%)"}}>{selRank}.</div>
                  <div className="flex items-center gap-2.5 ml-4"><span className="text-[#fbbf24] text-[22px]">🏆</span><span className="font-black text-[18px] tracking-wide">OVERALL</span><span className="text-zinc-500 font-bold text-[15px]">({selected.points||0} points)</span></div>
                </div>
              </div>
              <div className="w-full mt-7 text-left">
                <h3 className="text-[#5a647a] font-black text-[20px] tracking-wide mb-3">TIERS</h3>
                <div className="bg-[#0e121a] border border-[#1e2535] rounded-xl p-4">
                  <div className="grid grid-cols-5 gap-3">
                    {GAMEMODE_ORDER.map(gm=>{
                      const tier = getTierForMode(tiers, gm);
                      if(!tier) return (
                        <div key={gm} className="flex flex-col items-center opacity-25">
                          <div className="w-[44px] h-[44px] rounded-full bg-[#161a27] border border-[#1e2535] flex items-center justify-center">
                            <img src={GAMEMODE_ICONS[gm]} className="w-[22px] h-[22px] object-contain grayscale"/>
                          </div>
                          <span className="text-[9px] font-bold mt-1 text-zinc-600">{gm.toUpperCase()}</span>
                        </div>
                      );
                      let badgeClass = tier.startsWith("HT") ? "bg-[#5e320a] text-[#ff8c1a] border-[#8a4a0a]/50" : "bg-[#232a36] text-[#9ca3af] border-zinc-600/30";
                      if(tier==="HT1") badgeClass="bg-[#3f2f0a] text-[#fbbf24] border-amber-600/30";
                      return(
                        <div key={gm} className="flex flex-col items-center">
                          <div className="w-[44px] h-[44px] rounded-full bg-[#161a27] border border-[#222b3e] flex items-center justify-center">
                            <img src={GAMEMODE_ICONS[gm]} className="w-[22px] h-[22px] object-contain"/>
                          </div>
                          <span className="text-[8px] font-black mt-1 text-zinc-500">{gm.toUpperCase()}</span>
                          <span className={`text-[11px] font-black mt-1 px-2 py-0.5 rounded-md border ${badgeClass}`}>{tier}</span>
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
        <div onClick={()=>setShowInfo(false)} className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-10">
          <div onClick={e=>e.stopPropagation()} className="bg-[#111521] border border-[#1e2535] rounded-2xl w-full max-w-[400px] overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#111521] p-2 z-10">
              <div className="bg-[#1a2030] rounded-full p-1 flex">
                <button onClick={()=>setInfoTab("Titles")} className={`flex-1 py-2.5 rounded-full text-sm font-bold ${infoTab==="Titles"?"bg-[#252e42] text-white":"text-zinc-500"}`}>Titles</button>
                <button onClick={()=>setInfoTab("Points")} className={`flex-1 py-2.5 rounded-full text-sm font-bold ${infoTab==="Points"?"bg-[#252e42] text-white":"text-zinc-500"}`}>Points</button>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              {infoTab==="Titles" ? (
                <><h3 className="font-bold text-[16px] mb-5">How to obtain <span className="underline decoration-amber-400">Achievement Titles</span></h3><div className="space-y-4">{ACHIEVEMENT_TITLES.map(t=>(<div key={t.name} className="flex flex-col gap-1"><div className={`flex items-center gap-2 font-bold text-[14px] ${t.color}`}><span className="text-[18px]">⬣</span> {t.name}</div><div className="text-zinc-500 text-[13px] ml-7">Obtained {t.min}+ total points.</div></div>))}</div></>
              ) : (
                <><h3 className="font-bold text-[16px] mb-5">How <span className="underline decoration-amber-400">ranking points</span> are calculated</h3><div className="space-y-5">{RANKING_POINTS.map(r=>(<div key={r.tier}><div className={`flex items-center gap-2 font-bold mb-2.5 text-[15px] ${r.color}`}>{r.icon && <span>{r.icon}</span>} {r.tier}</div><div className="flex gap-2 ml-1 border-l-2 border-[#1e2535] pl-4"><div className="bg-[#1e2535] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[13px] font-bold">{r.lt} Points</div><div className="bg-[#2a2f3a] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[13px] font-bold">{r.ht} Points</div></div></div>))}</div></>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}