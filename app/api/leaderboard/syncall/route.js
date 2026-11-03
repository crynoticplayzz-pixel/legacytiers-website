import fs from 'fs'
import path from 'path'

const getFilePath = () => {
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'leaderboard.json'),
    path.join(process.cwd(), 'app', 'data', 'leaderboard.json'),
    path.join(process.cwd(), '..', 'data', 'leaderboard.json')
  ]
  for(let p of possiblePaths){
    if(fs.existsSync(p)) return p
  }
  return path.join(process.cwd(), 'data', 'leaderboard.json')
}

export async function GET(){
  try {
    const filePath = getFilePath()
    console.log('Reading from:', filePath, 'exists:', fs.existsSync(filePath))
    if (!fs.existsSync(filePath)) return Response.json([])
    const data = fs.readFileSync(filePath, 'utf8')
    return Response.json(JSON.parse(data))
  } catch(e) {
    return Response.json({ error: e.message, path: getFilePath() }, { status: 500 })
  }
}

export async function POST(req){
  const data = await req.json()
  const filePath = getFilePath()
  
  let leaderboard = []
  try{ 
    if(fs.existsSync(filePath)) leaderboard = JSON.parse(fs.readFileSync(filePath, 'utf8')) 
  }catch{ leaderboard = [] }

  const POINTS = { \"HT1\":60,\"HT2\":40,\"HT3\":20,\"LT1\":10,\"LT2\":5,\"LT3\":2 }
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
  
  leaderboard.sort((a,b) => b.points - a.points)
  
  try{ fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2)) }catch{}
  return Response.json({ success: true, points: total })
}
