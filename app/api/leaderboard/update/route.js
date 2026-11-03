import leaderboardData from '../../../../data/leaderboard.json'

export async function GET(){
  return Response.json(leaderboardData)
}

export async function POST(req){
  const data = await req.json()
  return Response.json({ success: true, received: data })
}