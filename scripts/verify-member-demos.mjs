import oracledb from 'oracledb';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {members} from './member-demo-data.mjs';
import {ddlSteps} from './prepare-member-demos.mjs';
const c=await oracledb.getConnection({user:process.env.ORACLE_USER,password:process.env.ORACLE_PASSWORD,connectString:process.env.ORACLE_CONNECT_STRING});
const all=[];
try{
 for(const m of members){
  // Abort on a fixture collision; never overwrite or silently remove a pre-existing record.
  const checks=m.slug==='tanisi'?[['category','category_id',m.ids[0]],['cuisine','cuisine_id',m.ids[1]],['dietary_type','dietary_type_id',m.ids[2]]]:[[m.slug==='trisha'?'food_item':m.slug==='asmi'?'allergen':'restaurant',m.slug==='trisha'?'food_id':m.slug==='asmi'?'allergen_id':'restaurant_id',m.ids[0]]];
  for(const [table,column,id] of checks){const r=await c.execute(`SELECT COUNT(*) FROM ${table} WHERE ${column}=:id`,{id});assert.equal(r.rows[0][0],0,`Fixture ${id} already exists. Finish that member's cleanup before re-running.`);}
  const outputs=[];
  const groups=[['writes',m.writes],['selects',m.selects],...(m.transactions?[['transactions',m.transactions]]:[]),['deletes',m.deletes],...(m.slug==='soha'?[['ddl',ddlSteps]]:[])];
  for(const [group,steps] of groups){for(const step of steps){const parts=step.sql.split(/;\s*\n/).map(s=>s.trim()).filter(Boolean);const results=[];for(const sql of parts){const r=await c.execute(sql,{}, {outFormat:oracledb.OUT_FORMAT_OBJECT});results.push({sql,rows:r.rows||[],rowsAffected:r.rowsAffected??null});if(/^INSERT|^UPDATE|^DELETE/.test(sql))assert.equal(r.rowsAffected,1,`${m.name}: ${step.title}`);}
   if(group==='selects'&&step.title.startsWith('S1'))assert.equal(results[0].rows.length,m.slug==='tanisi'?3:1);
   if(group==='deletes'&&step.title==='Verify cleanup')assert.equal(results[0].rows[0].REMAINING,0);
   outputs.push({group,...step,results});
  }}
  all.push({name:m.name,module:m.module,outputs});console.log(`${m.name}: CRUD, ${m.selects.length} SELECTs, cleanup${m.transactions?', transaction rollback and DDL':''} verified on Oracle.`);
 }
 mkdirSync('docs/member-demo',{recursive:true});
 writeFileSync('docs/member-demo/verified-results.json',JSON.stringify({executedAt:new Date().toISOString(),database:'VEATS_APP / FREEPDB1',members:all},null,2));
 console.log('All five modules verified; temporary fixtures removed.');
}catch(e){await c.rollback();throw e}finally{await c.close()}
