import {reports} from '@/lib/reports';
import {query} from '@/lib/oracle';
import {authorized} from '@/lib/admin-auth';
export async function GET(req:Request){if(!await authorized())return Response.json({error:'Sign in required'},{status:401});const id=new URL(req.url).searchParams.get('id');if(!id)return Response.json({reports:reports.map(({id,title,concept,sql})=>({id,title,concept,sql}))});const report=reports.find(r=>r.id===id);if(!report)return Response.json({error:'Unknown report'},{status:404});try{return Response.json({...report,rows:await query(report.sql,report.binds),executedAt:new Date().toISOString()});}catch{return Response.json({error:'Query failed. Check Oracle connection.'},{status:503});}}
