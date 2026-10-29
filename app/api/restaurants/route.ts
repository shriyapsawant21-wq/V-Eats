import { getCatalog } from '@/lib/db';
export async function GET() { try { return Response.json((await getCatalog()).restaurants); } catch { return Response.json({error:'Database unavailable'},{status:503}); } }
