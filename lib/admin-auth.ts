import {cookies} from 'next/headers';
import {createHmac,timingSafeEqual} from 'node:crypto';
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function sign(value:string){return createHmac('sha256',process.env.ADMIN_TOKEN||'unconfigured').update(value).digest('hex');}
export async function authorized(){if(!process.env.ADMIN_TOKEN)return false;const token=(await cookies()).get('veats-admin')?.value||'';const [expiry,signature]=token.split('.');return Number(expiry)>Date.now()&&equal(signature||'',sign(expiry||''));}
