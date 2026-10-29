import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import oracledb from 'oracledb';
const base=process.env.VEATS_BASE_URL||'http://localhost:3000';
const log=[];let cookie='';
async function req(path,method='GET',body,expected=200){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Origin:base,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.equal(r.status,expected,`${method} ${path}: ${JSON.stringify(data)}`);return {data,r};}
const id='TEST_'+Date.now();
const created=[];
async function write(entity,method,record,expected=200){const {data}=await req('/api/manage',method,{entity,record},expected);if(expected===200)log.push(`${method} ${entity}: OK`);return data;}
try{
 await req('/api/manage?entity=restaurant','GET',null,401);log.push('Unauthenticated management access rejected: OK');
 const login=await req('/api/admin-session','POST',{token:process.env.ADMIN_TOKEN});cookie=login.r.headers.get('set-cookie').split(';')[0];
 const {data:catalog}=await req('/api/catalog');assert.equal(catalog.mode,'oracle');assert.ok(catalog.restaurants.length>=5);log.push('Catalog reads live Oracle: OK');
 for(const entity of ['restaurant','food_item','contains','has_allergen','category','cuisine','dietary_type','allergen']){const {data}=await req('/api/manage?entity='+entity);assert.ok(data.rows.length>0);log.push(`Display ${entity}: ${data.rows.length} rows`);}
 const fixtures=[['category',{category_id:id,category_name:id}],['cuisine',{cuisine_id:id,cuisine_name:id}],['dietary_type',{dietary_type_id:id,type_name:id}],['allergen',{allergen_id:id,allergen_name:id}],['restaurant',{restaurant_id:id,restaurant_name:id,block:'TEST',landmark:'Integration test',must_have:'[]'}],['food_item',{food_id:id,food_name:id,category_id:id,cuisine_id:id,dietary_type_id:id,description:'Integration test'}],['contains',{restaurant_id:id,food_id:id,price:100,price_note:'Integration test'}],['has_allergen',{food_id:id,allergen_id:id}]];
 for(const [entity,record] of fixtures){await write(entity,'POST',record);created.push([entity,record]);const {data}=await req(`/api/manage?entity=${entity}&q=${id}`);assert.ok(data.rows.length);log.push(`Search ${entity}: OK`);}
 for(const [entity,record] of fixtures){const field=Object.keys(record).find(k=>k.endsWith('_name'))||(entity==='dietary_type'?'type_name':entity==='contains'?'price':entity==='restaurant'?'landmark':null);if(field){record[field]=field==='price'?125:id+'_UPDATED';await write(entity,'PUT',record);}}
 await req('/api/manage','PUT',{entity:'has_allergen',original:{food_id:id,allergen_id:id},record:{food_id:id,allergen_id:'Milk'}});log.push('PUT has_allergen relationship: OK');
 created.find(x=>x[0]==='has_allergen')[1].allergen_id='Milk';
 const {data:changed}=await req('/api/catalog');assert.ok(changed.contains.some(m=>m.restaurantId===id&&m.price===125));assert.ok(changed.hasAllergen.some(a=>a.foodId===id&&a.allergenId==='Milk'));assert.equal(changed.lookupNames.category[id],id+'_UPDATED');log.push('Committed price, allergen and category-name updates visible in discovery catalog: OK');
 await write('category','POST',{category_id:id,category_name:'Duplicate'},409);log.push('Duplicate primary key rejected: OK');
 await write('contains','POST',{restaurant_id:'MISSING_'+id,food_id:id,price:10},409);log.push('Invalid foreign key rejected: OK');
 await write('category','DELETE',{category_id:id},409);log.push('Referenced parent deletion rejected: OK');
 await write('contains','PUT',{restaurant_id:id,food_id:id,price:-1},400);log.push('Negative price rejected: OK');
 const {data:tx}=await req('/api/transaction-demo','POST');assert.equal(tx.steps.at(-1).result[0][0],0);log.push('Live transaction API restores savepoint and rolls back insert: OK');
 const {data:list}=await req('/api/reports');for(const report of list.reports){const {data}=await req('/api/reports?id='+report.id);assert.ok(Array.isArray(data.rows));log.push(`SQL report ${report.id}: ${data.rows.length} rows`);}
 for(const [entity,record] of [...created].reverse()){await write(entity,'DELETE',record);created.splice(created.findIndex(x=>x[0]===entity),1);const {data}=await req(`/api/manage?entity=${entity}&q=${id}`);assert.equal(data.rows.length,0);}
 const c=await oracledb.getConnection({user:process.env.ORACLE_USER,password:process.env.ORACLE_PASSWORD,connectString:process.env.ORACLE_CONNECT_STRING});try{const found=await c.execute('SELECT COUNT(*) FROM restaurant WHERE restaurant_id=:id',{id});assert.equal(found.rows[0][0],0);log.push('Deletion verified using independent Oracle connection: OK');await c.execute('SAVEPOINT verification');await c.execute('INSERT INTO category(category_id,category_name) VALUES (:id,:name)',{id,name:id});await c.rollback();const r=await c.execute('SELECT COUNT(*) FROM category WHERE category_id=:id',{id});assert.equal(r.rows[0][0],0);log.push('ROLLBACK removes uncommitted insert: OK');}finally{await c.close()}
 writeFileSync('docs/integration-results.md',`# Integration verification\n\nExecuted ${new Date().toISOString()} against ${base}.\n\n`+log.map(x=>'- '+x).join('\n')+'\n');console.log(log.join('\n'));console.log('All integration checks passed. Test records removed.');
}finally{for(const [entity,record] of [...created].reverse()){try{await write(entity,'DELETE',record)}catch{console.error(`Cleanup required for ${entity} ${id}`)}}}
