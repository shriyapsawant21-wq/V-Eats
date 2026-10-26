import { getCatalog } from '@/lib/db';
export async function GET(request: Request) { try { const data = await getCatalog(); const q = new URL(request.url).searchParams.get('q')?.toLowerCase() || ''; return Response.json(data.foods.filter(f => f.name.toLowerCase().includes(q))); } catch { return Response.json({error:'Database unavailable'},{status:503}); } }
