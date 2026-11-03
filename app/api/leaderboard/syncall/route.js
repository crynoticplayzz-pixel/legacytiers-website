import fs from 'fs'
import path from 'path'

const getFilePath = () => {
  // Vercel pe /tmp use hota hai, local pe website/data
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  return path.join(dataDir, 'leaderboard.json')
}

// GET - website ranking dikhane ke liye
export async function GET(){
  try {
    const filePath = getFilePath()
    if (!fs.existsSync(filePath)) return Response.json([])
    const data = fs.readFileSync(filePath, 'utf8')
    return Response.json(JSON.parse(data))
  } catch {
    return Response.json([])
  }
}

// POST - bot se data aane ke liye
export async function POST(req){
  const data = await req.json()
  const filePath = getFilePath()
  
  let leaderboard = []
  try{ 
    if(fs.existsSync(filePath)) leaderboard = JSON.parse(fs.readFileSync(filePath, 'utf8')) 
  }catch{ leaderboard = [] }

  // Tere points ke hisab se - HT1=60 jo tune page.tsx me diya tha
  const POINTS = { "HT1":60,"HT2":40,"HT3":20,"LT1":10,"LT2":5,"LT3":2 }
  let total = 0
  if(data.tiers){
    for(let gm in data.tiers){ total += POINTS[data.tiers[gm]] || 0 }
  }

  let player = leaderboard.find(p => p.discordId === data.discordId || p.ign === data.ign)
  
  if(player){
    player.ign = data.ign
    player.region = data.region
    player.tiers = data.tiers || player.tiers
    player.points = total
    player.avatar = data.avatar
    player.updatedAt = new Date().toISOString()
  } else {
    leaderboard.push({
      discordId: data.discordId,
      ign: data.ign,
      region: data.region,
      tiers: data.tiers || {},
      points: total,
      avatar: data.avatar,
      updatedAt: new Date().toISOString()
    })
  }
  
  // Points ke hisab se sort
  leaderboard.sort((a,b) => b.points - a.points)
  
  fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2))
  return Response.json({ success: true, points: total })
}