import oracledb from 'oracledb';
import {readFileSync,writeFileSync} from 'node:fs';
import {foods,hasAllergen} from '../lib/data.ts';
const c=await oracledb.getConnection({user:process.env.ORACLE_USER,password:process.env.ORACLE_PASSWORD,connectString:process.env.ORACLE_CONNECT_STRING});
const sqlLiteral=(x:unknown)=>x===null||x===undefined?'NULL':typeof x==='number'?String(x):`'${String(x).replaceAll("'","''")}'`;
const inserts:string[]=[];
async function insert(table:string,record:Record<string,unknown>,keys:string[]){
 const fields=Object.keys(record);const exists=await c.execute(`SELECT 1 FROM ${table} WHERE ${keys.map(k=>`${k}=:${k}`).join(' AND ')}`,Object.fromEntries(keys.map(k=>[k,record[k]])) as oracledb.BindParameters);
 inserts.push(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(f=>sqlLiteral(record[f])).join(', ')});`);
 if(!exists.rows?.length)await c.execute(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(f=>':'+f).join(',')})`,record as oracledb.BindParameters);
}
try{
 const ddl=readFileSync('sql/01-schema.sql','utf8').replace(/^--.*$/gm,'');
 for(const statement of ddl.split(/;\s*(?:\r?\n|$)/).map(s=>s.trim()).filter(Boolean)){try{await c.execute(statement)}catch(e){if((e as {errorNum:number}).errorNum!==955)throw e}}
 for(const [table,id,name,values] of [
 ['category','category_id','category_name',['Meals','Snacks','Beverages','Desserts']],
 ['cuisine','cuisine_id','cuisine_name',['Indian','Italian','Asian','Continental']],
 ['dietary_type','dietary_type_id','type_name',['Vegetarian','Vegan','Non-vegetarian']],
 ['allergen','allergen_id','allergen_name',['Milk','Gluten','Nuts','Soy','Eggs']]
 ] as [string,string,string,string[]][]){for(const v of values)await insert(table,{[id]:v,[name]:v},[id]);}
 const outlets=[
 {id:'r1',name:'GDN Canteen',block:'GDN',landmark:'G. D. Naidu Block, VIT Vellore',image:'photo-1555396273-367ea4eb4db5',source:'https://vit.ac.in/files/sustainability-initiatives/Green-Audit-Report.pdf',note:'Campus canteen location documented by VIT. Menu and prices are demonstration data.'},
 {id:'r2',name:'SJT Canteen',block:'SJT',landmark:'Silver Jubilee Tower, VIT Vellore',image:'photo-1579751626657-72bc17010498',source:'https://vit.ac.in/files/sustainability-initiatives/Green-Audit-Report.pdf',note:'Campus canteen location documented by VIT. Menu and prices are demonstration data.'},
 {id:'r3',name:'Technology Tower Food Court',block:'TT',landmark:'Near Technology Tower, VIT Vellore',image:'photo-1555396273-367ea4eb4db5',source:'https://vit.ac.in/files/sustainability-initiatives/Green-Audit-Report.pdf',note:'Campus canteen location documented by VIT. Menu and prices are demonstration data.'},
 {id:'r4',name:'One Food World',block:'Mens Hostel',landmark:'Gorbachev Road, VIT Vellore',image:'photo-1501339847302-ac426a4a7cbb',source:'https://icnan.vit.ac.in/ICNAN%E2%80%9925%20Conference%20Schedule.pdf',note:'Outlet appears on the official VIT conference campus map. Menu and prices are demonstration data.'},
 {id:'r5',name:'PRP Canteen',block:'PRP',landmark:'Pearl Research Park, VIT Vellore',image:'photo-1555396273-367ea4eb4db5',source:'https://vit.ac.in/files/sustainability-initiatives/Green-Audit-Report.pdf',note:'Campus canteen location documented by VIT. Menu and prices are demonstration data.'}
 ];
 for(const r of outlets)await insert('restaurant',{restaurant_id:r.id,restaurant_name:r.name,block:r.block,landmark:r.landmark,must_have:'[]',image:r.image,source_url:r.source,source_note:r.note},['restaurant_id']);
 const extra=[
 {id:'f9',name:'Idli Sambar',categoryId:'Meals',cuisineId:'Indian',dietaryTypeId:'Vegan',description:'Sample breakfast listing: steamed rice cakes with sambar.',image:'photo-1668236543090-82eba5ee5976'},
 {id:'f10',name:'Veg Fried Rice',categoryId:'Meals',cuisineId:'Asian',dietaryTypeId:'Vegan',description:'Sample menu listing: rice with vegetables and soy sauce.',image:'photo-1569718212165-3a8278d5f624'},
 {id:'f11',name:'Filter Coffee',categoryId:'Beverages',cuisineId:'Indian',dietaryTypeId:'Vegetarian',description:'Sample menu listing: South Indian filter coffee with milk.',image:'photo-1461023058943-07fcbe16d735'},
 {id:'f12',name:'French Fries',categoryId:'Snacks',cuisineId:'Continental',dietaryTypeId:'Vegan',description:'Sample menu listing: crisp potato fries.',image:'photo-1573080496219-bb080dd4f877'}
 ];
 for(const f of [...foods,...extra])await insert('food_item',{food_id:f.id,food_name:f.name,category_id:f.categoryId,cuisine_id:f.cuisineId,dietary_type_id:f.dietaryTypeId,description:f.description,image:f.image},['food_id']);
 const menus=[['r1','f7',65],['r1','f9',40],['r1','f11',25],['r1','f1',130],['r2','f7',70],['r2','f9',45],['r2','f10',100],['r2','f11',30],['r3','f1',145],['r3','f8',160],['r3','f10',110],['r3','f4',90],['r3','f2',180],['r4','f3',110],['r4','f4',100],['r4','f6',85],['r4','f12',80],['r4','f2',200],['r5','f7',60],['r5','f9',35],['r5','f11',20],['r5','f5',120],['r5','f10',95]];
 for(const [r,f,p] of menus)await insert('contains',{restaurant_id:r,food_id:f,price:p,price_note:'Sample price; not a verified outlet price'},['restaurant_id','food_id']);
 for(const a of [...hasAllergen,{foodId:'f10',allergenId:'Soy'},{foodId:'f11',allergenId:'Milk'}])await insert('has_allergen',{food_id:a.foodId,allergen_id:a.allergenId},['food_id','allergen_id']);
 await c.commit();
 writeFileSync('sql/02-seed.sql','-- Demonstration menus and prices, researched outlet names/locations. Run once after 01-schema.sql.\n'+inserts.join('\n')+'\nCOMMIT;\n');
 console.log('Oracle schema and seed complete: 8 tables, 5 outlets, 12 dishes, 23 menu prices. Existing records preserved.');
}catch(e){await c.rollback();throw e}finally{await c.close()}
