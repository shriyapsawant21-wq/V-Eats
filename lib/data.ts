export type Restaurant = {id:string;name:string;block:string;landmark:string;mustHave:string[];image:string;rating:number;time:string;tagline:string;sourceUrl?:string};
export type Food = {id:string;name:string;categoryId:string;cuisineId:string;dietaryTypeId:string;description:string;image:string};
export type Catalog = {restaurants:Restaurant[];foods:Food[];contains:{restaurantId:string;foodId:string;price:number}[];hasAllergen:{foodId:string;allergenId:string}[];categories:string[];cuisines:string[];dietaryTypes:string[];allergens:string[];mode:string;lookupNames?:Record<string,Record<string,string>>};
export const categories=['All food','Meals','Snacks','Beverages','Desserts'];
export const cuisines=['Indian','Italian','Asian','Continental'];
export const dietaryTypes=['Vegetarian','Vegan','Non-vegetarian'];
export const allergens=['Milk','Gluten','Nuts','Soy','Eggs'];
export const restaurants:Restaurant[]=[];
export const foods:Food[]=[
 {id:'f1',name:'Paneer Power Bowl',categoryId:'Meals',cuisineId:'Indian',dietaryTypeId:'Vegetarian',description:'Sample menu: paneer, rice, greens and mint dressing.',image:'photo-1512621776951-a57141f2eefd'},
 {id:'f2',name:'Margherita Pizza',categoryId:'Meals',cuisineId:'Italian',dietaryTypeId:'Vegetarian',description:'Sample menu: tomato, mozzarella and basil pizza.',image:'photo-1574071318508-1cdbab80d002'},
 {id:'f3',name:'Classic Veg Burger',categoryId:'Snacks',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Sample menu: vegetable patty, lettuce and sauce.',image:'photo-1568901346375-23c9450c58cd'},
 {id:'f4',name:'Iced Latte',categoryId:'Beverages',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Sample menu: espresso, ice and milk.',image:'photo-1461023058943-07fcbe16d735'},
 {id:'f5',name:'Garden Fresh Salad',categoryId:'Meals',cuisineId:'Continental',dietaryTypeId:'Vegan',description:'Sample menu: seasonal greens with lemon dressing.',image:'photo-1512621776951-a57141f2eefd'},
 {id:'f6',name:'Chocolate Brownie',categoryId:'Desserts',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Sample menu: chocolate brownie.',image:'photo-1606313564200-e75d5e30476c'},
 {id:'f7',name:'Masala Dosa',categoryId:'Meals',cuisineId:'Indian',dietaryTypeId:'Vegan',description:'Sample menu: rice crepe, spiced potato, chutney and sambar.',image:'photo-1668236543090-82eba5ee5976'},
 {id:'f8',name:'Chicken Noodle Bowl',categoryId:'Meals',cuisineId:'Asian',dietaryTypeId:'Non-vegetarian',description:'Sample menu: noodles, chicken and vegetables with soy sauce.',image:'photo-1569718212165-3a8278d5f624'}
];
export const contains:Catalog['contains']=[];
export const hasAllergen=[{foodId:'f1',allergenId:'Milk'},{foodId:'f2',allergenId:'Milk'},{foodId:'f2',allergenId:'Gluten'},{foodId:'f3',allergenId:'Gluten'},{foodId:'f4',allergenId:'Milk'},{foodId:'f6',allergenId:'Milk'},{foodId:'f6',allergenId:'Gluten'},{foodId:'f6',allergenId:'Nuts'},{foodId:'f8',allergenId:'Soy'},{foodId:'f8',allergenId:'Gluten'}];
export const demoCatalog:Catalog={restaurants:[],foods:[],contains:[],hasAllergen:[],categories:[],cuisines:[],dietaryTypes:[],allergens:[],mode:'loading'};
export const photo=(id:string,width=800)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
