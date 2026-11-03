import { kv } from '@vercel/kv'
import fallback from '../../../data/leaderboard.json'

const POINTS = { HT1:60, HT2:40, HT3:20, LT1:10, LT2:5, LT3:2 }
function calcPoints(tiers){
  let t=0
  for(let k in (tiers||{})) t+= POINTS[tiers[k]] || 0
  return t
}

export async function GET(){
  try{
    const data = await kv.get('leaderboard')
    if(data && data.length) return Response.json(data)
    return Response.json(fallback)
  }catch{
    return Response.json(fallback)
  }
}

export async function POST(req){
  try{
    const body = await req.json()
    let list = await kv.get('leaderboard')
    if(!list || !list.length) list = [...fallback]

    let p = list.find(x => x.discordId === body.discordId || x.ign?.toLowerCase() === body.ign?.toLowerCase())

    if(p){
      p.ign = body.ign || p.ign
      p.region = body.region || p.region
      p.tiers = { ...p.tiers, ...body.tiers }
      p.points = calcPoints(p.tiers)
      p.updatedAt = new Date().toISOString()
    } else {
      list.push({
        discordId: body.discordId,
        ign: body.ign,
        region: body.region || "NA",
        tiers: body.tiers || {},
        points: calcPoints(body.tiers),
        updatedAt: new Date().toISOString()
      })
    }

    list.sort((a,b)=>b.points-a.points)
    await kv.set('leaderboard', list)
    return Response.json({ success:true, leaderboard:list })
  }catch(e){
    return Response.json({ success:false, error:e.message }, {status:500})
  }
}