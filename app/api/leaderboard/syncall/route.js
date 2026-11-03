import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const POINTS_MAP = {
  "HT1": 60, "LT1": 45,
  "HT2": 30, "LT2": 20,
  "HT3": 10, "LT3": 6,
  "HT4": 4,  "LT4": 3,
  "HT5": 2,  "LT5": 1,
};

function calcPoints(tiers) {
  let total = 0;
  if (!tiers) return 0;
  if (typeof tiers === 'string') {
    try { tiers = JSON.parse(tiers); } catch { return 0; }
  }
  for (let k in tiers) {
    const v = (tiers[k] || "").toString().toUpperCase();
    total += POINTS_MAP[v] || 0;
  }
  return total;
}

function normalizeTiers(tiers) {
  if (!tiers) return {};
  if (typeof tiers === 'string') {
    try { tiers = JSON.parse(tiers); } catch { tiers = {}; }
  }
  const t = { ...tiers };
  if (t.spearmace) {
    if (!t.spear) t.spear = t.spearmace;
    delete t.spearmace;
  }
  if (t.cpvp && !t.vanilla) {
    t.vanilla = t.cpvp;
    delete t.cpvp;
  }
  const cleaned = {};
  for (let k in t) {
    cleaned[k.toLowerCase()] = (t[k] || "").toString().toUpperCase();
  }
  return cleaned;
}

export async function GET() {
  try {
    const data = await kv.get("players");
    let players = [];
    
    if (Array.isArray(data)) {
      players = data;
    } else if (data && typeof data === 'object') {
      players = Object.values(data);
    }
    
    return NextResponse.json(players);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.discordId) {
      return NextResponse.json({ error: "discordId missing" }, { status: 400 });
    }

    body.tiers = normalizeTiers(body.tiers);
    body.points = calcPoints(body.tiers);

    let players = [];
    const existing = await kv.get("players");
    
    if (Array.isArray(existing)) {
      players = existing;
    } else if (existing && typeof existing === 'object') {
      players = Object.values(existing);
    }

    const idx = players.findIndex((p) => p.discordId === body.discordId);
    if (idx >= 0) {
      players[idx] = { ...players[idx], ...body };
    } else {
      players.push(body);
    }

    await kv.set("players", players);
    
    return NextResponse.json({ success: true, points: body.points });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}