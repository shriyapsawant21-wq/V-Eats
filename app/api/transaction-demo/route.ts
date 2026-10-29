import {randomUUID} from 'node:crypto';
import {connection} from '@/lib/oracle';
import {authorized} from '@/lib/admin-auth';
export async function POST(req:Request){
 if(!await authorized())return Response.json({error:'Sign in required'},{status:401});
 const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return Response.json({error:'Invalid origin'},{status:403});
 const c=await connection(),id='TCL_'+randomUUID().slice(0,20);
 const steps:{sql:string;result:unknown}[]=[];
 try{
  await c.execute('INSERT INTO category(category_id,category_name) VALUES (:id,:name)',{id,name:id});
  steps.push({sql:'INSERT INTO category(category_id,category_name) VALUES (:id,:name)',result:{rowsAffected:1,id}});
  await c.execute('SAVEPOINT before_update');steps.push({sql:'SAVEPOINT before_update',result:'Savepoint created'});
  await c.execute("UPDATE category SET category_name='Temporary change' WHERE category_id=:id",{id});
  const updated=await c.execute('SELECT category_name FROM category WHERE category_id=:id',{id});
  steps.push({sql:"UPDATE category SET category_name='Temporary change' WHERE category_id=:id",result:updated.rows});
  await c.execute('ROLLBACK TO before_update');
  const restored=await c.execute('SELECT category_name FROM category WHERE category_id=:id',{id});
  steps.push({sql:'ROLLBACK TO before_update',result:restored.rows});
  await c.rollback();
  const removed=await c.execute('SELECT COUNT(*) FROM category WHERE category_id=:id',{id});
  steps.push({sql:'ROLLBACK; SELECT COUNT(*) FROM category WHERE category_id=:id',result:removed.rows});
  return Response.json({steps,executedAt:new Date().toISOString(),note:'No demonstration records remain. Management writes demonstrate COMMIT.'});
 }catch{await c.rollback();return Response.json({error:'Transaction demo failed; changes rolled back.'},{status:503});}finally{await c.close()}
}
