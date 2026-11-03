import leaderboardData from '../../../../data/leaderboard.json'

export async function GET(){
  try {
    return Response.json(leaderboardData)
  } catch {
    return Response.json([])
  }
}

export async function POST(req){
  const data = await req.json()
  return Response.json({ success: true, received: data })
}