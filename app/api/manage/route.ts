import {entities,type Entity} from '@/lib/entities';
import {connection,query} from '@/lib/oracle';
import {authorized} from '@/lib/admin-auth';

function entity(name:string|null):Entity {
 if(!name||!Object.hasOwn(entities,name))throw new Error('Unknown entity');
 return name as Entity;
}
function failure(e:unknown){
 const code=(e as {errorNum?:number}).errorNum;
 const message=code===1?'This ID or name already exists.':
 code===2292?'Remove related menu or allergen records before deleting this record.':
 code===2291?'A referenced record does not exist.':
 code===2290?'A value violates a database constraint. Check price and JSON fields.':
 code===1400?'All required fields must be filled.':
 code===12899?'A value is too long.':'Unable to save. Check the fields and database connection.';
 return Response.json({error:message},{status:code?409:400});
}
export async function GET(req:Request){
 if(!await authorized())return Response.json({error:'Sign in required'},{status:401});
 try{
  const url=new URL(req.url),name=entity(url.searchParams.get('entity')),def=entities[name];
  const q=url.searchParams.get('q')||'';
  const where=def.fields.map(f=>`LOWER(TO_CHAR(${f})) LIKE :q`).join(' OR ');
  return Response.json({rows:await query(`SELECT ${def.fields.join(',')} FROM ${name} WHERE ${where} ORDER BY ${def.keys.join(',')}`,{q:`%${q.toLowerCase()}%`})});
 }catch(e){return failure(e)}
}
async function write(req:Request,method:string){
 if(!await authorized())return Response.json({error:'Sign in required'},{status:401});
 const origin=req.headers.get('origin');
 if(origin&&new URL(origin).host!==req.headers.get('host'))return Response.json({error:'Invalid origin'},{status:403});
 let c;
 try{
  const body=await req.json(),name=entity(body.entity),def=entities[name];
  const fields=[...def.fields] as string[],keys=[...def.keys] as string[];
  const record=body.record||{},binds:Record<string,string|number|null>={};
  for(const field of fields){
   const value=record[field];
   if(value!==undefined&&value!==null&&typeof value!=='string'&&typeof value!=='number')throw Error('Invalid value');
   binds[field]=value===''||value===undefined?null:value;
  }
  for(const key of keys)if(!binds[key])throw Error('Missing ID');
  if(name==='restaurant'&&method!=='DELETE'){
   const parsed=JSON.parse(String(binds.must_have||'[]'));
   if(!Array.isArray(parsed)||parsed.some(x=>typeof x!=='string'))throw Error('Must-have must be a JSON array');
   binds.must_have=JSON.stringify(parsed);
   const url=String(binds.source_url||'');if(url&&!/^https?:\/\//.test(url))throw Error('Invalid source URL');
  }
  if(name==='contains'&&method!=='DELETE'){
   binds.price=Number(record.price);
   if(!Number.isFinite(binds.price)||binds.price<=0)throw Error('Invalid price');
   binds.price_note||='Sample price; verify with outlet';
  }
  c=await connection();
  let sql:string,used:string[];
  if(method==='POST'){
   used=fields;sql=`INSERT INTO ${name} (${fields.join(',')}) VALUES (${fields.map(f=>':'+f).join(',')})`;
  }else if(method==='PUT'&&name==='has_allergen'){
   const original=body.original||record;
   for(const key of keys){if(typeof original[key]!=='string'||!original[key])throw Error('Missing original key');binds['old_'+key]=original[key];}
   used=[...fields,...keys.map(k=>'old_'+k)];
   sql=`UPDATE has_allergen SET ${fields.map(f=>`${f}=:${f}`).join(',')} WHERE ${keys.map(k=>`${k}=:old_${k}`).join(' AND ')}`;
  }else{
   const where=keys.map(k=>`${k}=:${k}`).join(' AND ');
   if(method==='DELETE'){used=keys;sql=`DELETE FROM ${name} WHERE ${where}`;}
   else{const changes=fields.filter(f=>!keys.includes(f));used=fields;sql=`UPDATE ${name} SET ${changes.map(f=>`${f}=:${f}`).join(',')} WHERE ${where}`;}
  }
  const result=await c.execute(sql,Object.fromEntries(used.map(f=>[f,binds[f]])));
  if(!result.rowsAffected){await c.rollback();return Response.json({error:'Record not found'},{status:404});}
  await c.commit();return Response.json({ok:true,rowsAffected:result.rowsAffected});
 }catch(e){if(c)await c.rollback();return failure(e)}finally{if(c)await c.close()}
}
export const POST=(req:Request)=>write(req,'POST');
export const PUT=(req:Request)=>write(req,'PUT');
export const DELETE=(req:Request)=>write(req,'DELETE');
