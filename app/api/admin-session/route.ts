import {cookies} from 'next/headers';
import {equal,sign,authorized} from '@/lib/admin-auth';
export async function GET(){return Response.json({authenticated:await authorized()});}
export async function POST(req:Request){const {token}=await req.json();if(!process.env.ADMIN_TOKEN||typeof token!=='string'||!equal(token,process.env.ADMIN_TOKEN))return Response.json({error:'Invalid admin key'},{status:401});const expiry=String(Date.now()+8*60*60*1000);(await cookies()).set('veats-admin',`${expiry}.${sign(expiry)}`,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:28800});return Response.json({ok:true});}
export async function DELETE(){(await cookies()).delete('veats-admin');return Response.json({ok:true});}
