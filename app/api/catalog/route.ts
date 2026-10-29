import { getCatalog } from '@/lib/db';
export async function GET() { try { return Response.json(await getCatalog()); } catch { return Response.json({error:'Oracle unavailable. Check the oracle-free container and local connection settings.'},{status:503}); } }
