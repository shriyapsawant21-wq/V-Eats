export const entities = {
 restaurant: {label:'Restaurants', keys:['restaurant_id'], fields:['restaurant_id','restaurant_name','block','landmark','must_have','image','source_url','source_note']},
 food_item: {label:'Food items',keys:['food_id'],fields:['food_id','food_name','category_id','cuisine_id','dietary_type_id','description','image']},
 contains: {label:'Menu prices',keys:['restaurant_id','food_id'],fields:['restaurant_id','food_id','price','price_note']},
 has_allergen: {label:'Food allergens',keys:['food_id','allergen_id'],fields:['food_id','allergen_id']},
 category: {label:'Categories',keys:['category_id'],fields:['category_id','category_name']},
 cuisine: {label:'Cuisines',keys:['cuisine_id'],fields:['cuisine_id','cuisine_name']},
 dietary_type: {label:'Dietary types',keys:['dietary_type_id'],fields:['dietary_type_id','type_name']},
 allergen: {label:'Allergens',keys:['allergen_id'],fields:['allergen_id','allergen_name']}
} as const;
export type Entity = keyof typeof entities;
