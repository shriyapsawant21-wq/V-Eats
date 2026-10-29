import {query} from './oracle';
import type {Catalog} from './data';
export async function getCatalog():Promise<Catalog> {
 const [rs,fs,menus,links,cats,cuisines,diets,allergens]=await Promise.all([
 query('SELECT * FROM restaurant ORDER BY restaurant_name'),query('SELECT * FROM food_item ORDER BY food_name'),
 query('SELECT * FROM contains ORDER BY restaurant_id,food_id'),query('SELECT * FROM has_allergen'),
 query('SELECT * FROM category ORDER BY category_name'),query('SELECT * FROM cuisine ORDER BY cuisine_name'),
 query('SELECT * FROM dietary_type ORDER BY type_name'),query('SELECT * FROM allergen ORDER BY allergen_name')]);
 return {restaurants:rs.map(r=>({id:String(r.restaurant_id),name:String(r.restaurant_name),block:String(r.block),landmark:String(r.landmark),mustHave:JSON.parse(String(r.must_have||'[]')),image:String(r.image||'photo-1555396273-367ea4eb4db5'),rating:0,time:'',tagline:String(r.source_note||''),sourceUrl:String(r.source_url||'')})),
 foods:fs.map(f=>({id:String(f.food_id),name:String(f.food_name),categoryId:String(f.category_id),cuisineId:String(f.cuisine_id),dietaryTypeId:String(f.dietary_type_id),description:String(f.description||''),image:String(f.image||'photo-1512621776951-a57141f2eefd')})),
 contains:menus.map(m=>({restaurantId:String(m.restaurant_id),foodId:String(m.food_id),price:Number(m.price)})),
 hasAllergen:links.map(a=>({foodId:String(a.food_id),allergenId:String(a.allergen_id)})),
 categories:['All food',...cats.map(c=>String(c.category_id))],cuisines:cuisines.map(c=>String(c.cuisine_id)),dietaryTypes:diets.map(d=>String(d.dietary_type_id)),allergens:allergens.map(a=>String(a.allergen_id)),mode:'oracle',lookupNames:{category:Object.fromEntries(cats.map(c=>[String(c.category_id),String(c.category_name)])),cuisine:Object.fromEntries(cuisines.map(c=>[String(c.cuisine_id),String(c.cuisine_name)])),diet:Object.fromEntries(diets.map(d=>[String(d.dietary_type_id),String(d.type_name)])),allergen:Object.fromEntries(allergens.map(a=>[String(a.allergen_id),String(a.allergen_name)]))}};
}
