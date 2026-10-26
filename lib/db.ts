import { MongoClient } from 'mongodb';
import { demoCatalog, type Catalog } from './data';
const globalDb = globalThis as unknown as { mongo?: Promise<MongoClient> };
export async function getCatalog(): Promise<Catalog> {
 if (!process.env.MONGODB_URI) return demoCatalog;
 globalDb.mongo ??= new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect();
 const db = (await globalDb.mongo).db(process.env.MONGODB_DB || 'veats');
 const names = ['restaurants','foods','contains','hasAllergen','categories','cuisines','dietaryTypes','allergens'] as const;
 const rows = await Promise.all(names.map(name => db.collection(name).find({}, {projection:{_id:0}}).toArray()));
 const result = Object.fromEntries(names.map((name,i) => [name, i >= 4 ? rows[i].map(row => row.name) : rows[i]]));
 return {...result, mode:'mongodb'} as Catalog;
}
