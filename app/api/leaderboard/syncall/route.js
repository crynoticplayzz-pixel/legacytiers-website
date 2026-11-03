import leaderboardData from '@/data/leaderboard.json'

export async function GET(){
  try {
    return Response.json(leaderboardData)
  } catch {
    return Response.json([])
  }
}

export async function POST(req){
  // Abhi ke liye seed data hi return karo, POST ko baad me KV se karenge
  const data = await req.json()
  return Response.json({ success: true, received: data })
}