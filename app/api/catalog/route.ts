import { getCatalog } from '@/lib/db';
export async function GET() { try { return Response.json(await getCatalog()); } catch { return Response.json({error:'Database unavailable. Check your MongoDB connection and seed the database.'},{status:503}); } }
