import { MongoClient } from 'mongodb';
import { demoCatalog } from '../lib/data.ts';
async function seed() {
 const uri=process.env.MONGODB_URI;
 if(!uri) throw new Error('Set MONGODB_URI before seeding. Example: node --env-file=.env.local --experimental-strip-types scripts/seed.ts');
 const client=await new MongoClient(uri).connect();
 try {
  const db=client.db(process.env.MONGODB_DB||'veats');
  for(const [name,value] of Object.entries(demoCatalog)) {
   if(!Array.isArray(value)) continue;
   const rows=value.map((v:any)=>typeof v==='string'?{id:v,name:v}:v);
   const collection=db.collection(name);
   const key: Record<string,1>=name==='contains'?{restaurantId:1,foodId:1}:name==='hasAllergen'?{foodId:1,allergenId:1}:{id:1};
   await collection.createIndex(key,{unique:true});
   for(const row of rows) {
    const filter=Object.fromEntries(Object.keys(key).map(k=>[k,row[k]]));
    await collection.updateOne(filter,{$setOnInsert:row},{upsert:true});
   }
   console.log(`Seeded ${name}: ${rows.length} demo records (existing records preserved)`);
  }
 } finally { await client.close(); }
}
seed().catch(error=>{console.error(error.message);process.exitCode=1;});
