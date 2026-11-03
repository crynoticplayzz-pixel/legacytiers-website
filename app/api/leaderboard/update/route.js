import fs from 'fs'
import path from 'path'

const getFilePath = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  return path.join(dataDir, 'leaderboard.json')
}

export async function GET(){
  try {
    const filePath = getFilePath()
    if (!fs.existsSync(filePath)) return Response.json([])
    const data = fs.readFileSync(filePath, 'utf8')
    return Response.json(JSON.parse(data))
  } catch { return Response.json([]) }
}

export async function POST(req){
  try{
    const body = await req.json()
    const filePath = getFilePath()
    let leaderboard = []
    try{ if(fs.existsSync(filePath)) leaderboard = JSON.parse(fs.readFileSync(filePath, 'utf8')) }catch{ leaderboard = [] }

    // Agar bulk aaya to syncall ki tarah save karo
    if(Array.isArray(body) || body.bulk){
      const players = Array.isArray(body) ? body : body.bulk
      players.sort((a,b) => (b.points||0)-(a.points||0))
      fs.writeFileSync(filePath, JSON.stringify(players, null, 2))
      return Response.json({ success: true, count: players.length })
    }

    // Single player update
    const data = body
    const POINTS = { "HT1":60,"HT2":40,"HT3":20,"LT1":10,"LT2":5,"LT3":2 }
    let total = 0
    if(data.tiers) for(let gm in data.tiers) total += POINTS[data.tiers[gm]] || 0
    else total = data.points || 0

    let player = leaderboard.find(p => p.discordId === data.discordId || p.ign === data.ign)
    if(player){
      player.ign = data.ign
      player.region = data.region || player.region
      player.tiers = data.tiers || player.tiers
      player.points = total
      player.avatar = data.avatar || player.avatar
    } else {
      leaderboard.push({ discordId: data.discordId, ign: data.ign, region: data.region||"NA", tiers: data.tiers||{}, points: total, avatar: data.avatar||null })
    }
    leaderboard.sort((a,b) => b.points - a.points)
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2))
    return Response.json({ success: true, points: total })
  }catch(e){
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}