export const categories = ['All food', 'Meals', 'Snacks', 'Beverages', 'Desserts'];
export const cuisines = ['Indian', 'Italian', 'Asian', 'Continental'];
export const dietaryTypes = ['Vegetarian', 'Vegan', 'Non-vegetarian'];
export const allergens = ['Milk', 'Gluten', 'Nuts', 'Soy', 'Eggs'];
export type Restaurant = { id: string; name: string; block: string; landmark: string; mustHave: string[]; image: string; rating: number; time: string; tagline: string };
export type Food = { id: string; name: string; categoryId: string; cuisineId: string; dietaryTypeId: string; description: string; image: string };
export const restaurants: Restaurant[] = [
 { id:'r1', name:'The Green Bowl', block:'A Block', landmark:'Opposite the central library', mustHave:['Paneer Power Bowl','Garden Fresh Salad'], image:'photo-1512621776951-a57141f2eefd', rating:4.8, time:'10–15 min', tagline:'Fresh bowls. Feel-good food.' },
 { id:'r2', name:'Crust & Co.', block:'Food Court', landmark:'Next to the student centre', mustHave:['Margherita Pizza'], image:'photo-1579751626657-72bc17010498', rating:4.7, time:'15–20 min', tagline:'A little slice of happiness.' },
 { id:'r3', name:'The Campus Kitchen', block:'B Block', landmark:'Near the main auditorium', mustHave:['Classic Veg Burger','Masala Dosa'], image:'photo-1555396273-367ea4eb4db5', rating:4.6, time:'10–20 min', tagline:'Big cravings. Campus prices.' },
 { id:'r4', name:'Brew & Bite', block:'A Block', landmark:'Inside the innovation hub', mustHave:['Iced Latte','Chocolate Brownie'], image:'photo-1501339847302-ac426a4a7cbb', rating:4.9, time:'5–10 min', tagline:'Your between-classes ritual.' }
];
export const foods: Food[] = [
 {id:'f1',name:'Paneer Power Bowl',categoryId:'Meals',cuisineId:'Indian',dietaryTypeId:'Vegetarian',description:'Grilled paneer, fragrant rice, crunchy greens and our signature mint dressing.',image:'photo-1512621776951-a57141f2eefd'},
 {id:'f2',name:'Margherita Pizza',categoryId:'Meals',cuisineId:'Italian',dietaryTypeId:'Vegetarian',description:'A golden crust with slow-cooked tomato sauce, mozzarella and fresh basil.',image:'photo-1574071318508-1cdbab80d002'},
 {id:'f3',name:'Classic Veg Burger',categoryId:'Snacks',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Crispy vegetable patty, fresh lettuce and tangy sauce in a toasted bun.',image:'photo-1568901346375-23c9450c58cd'},
 {id:'f4',name:'Iced Latte',categoryId:'Beverages',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Fresh espresso poured over ice and creamy milk. Your afternoon, upgraded.',image:'photo-1461023058943-07fcbe16d735'},
 {id:'f5',name:'Garden Fresh Salad',categoryId:'Meals',cuisineId:'Continental',dietaryTypeId:'Vegan',description:'Seasonal greens, cherry tomatoes, cucumber and a bright lemon dressing.',image:'photo-1512621776951-a57141f2eefd'},
 {id:'f6',name:'Chocolate Brownie',categoryId:'Desserts',cuisineId:'Continental',dietaryTypeId:'Vegetarian',description:'Rich dark chocolate, a soft centre and a satisfyingly crackly top.',image:'photo-1606313564200-e75d5e30476c'},
 {id:'f7',name:'Masala Dosa',categoryId:'Meals',cuisineId:'Indian',dietaryTypeId:'Vegan',description:'Crisp rice crepe with spiced potato filling, coconut chutney and sambar.',image:'photo-1668236543090-82eba5ee5976'},
 {id:'f8',name:'Chicken Noodle Bowl',categoryId:'Meals',cuisineId:'Asian',dietaryTypeId:'Non-vegetarian',description:'Wok-tossed noodles, tender chicken and crunchy vegetables in soy sauce.',image:'photo-1569718212165-3a8278d5f624'}
];
export const contains = [ {restaurantId:'r1',foodId:'f1',price:149},{restaurantId:'r2',foodId:'f2',price:199},{restaurantId:'r3',foodId:'f3',price:89},{restaurantId:'r4',foodId:'f4',price:99},{restaurantId:'r1',foodId:'f5',price:129},{restaurantId:'r4',foodId:'f6',price:79},{restaurantId:'r3',foodId:'f7',price:69},{restaurantId:'r3',foodId:'f8',price:159},{restaurantId:'r3',foodId:'f1',price:139} ];
export const hasAllergen = [ {foodId:'f1',allergenId:'Milk'},{foodId:'f2',allergenId:'Milk'},{foodId:'f2',allergenId:'Gluten'},{foodId:'f3',allergenId:'Gluten'},{foodId:'f4',allergenId:'Milk'},{foodId:'f6',allergenId:'Milk'},{foodId:'f6',allergenId:'Gluten'},{foodId:'f6',allergenId:'Nuts'},{foodId:'f8',allergenId:'Soy'},{foodId:'f8',allergenId:'Gluten'} ];
export const demoCatalog = { restaurants, foods, contains, hasAllergen, categories, cuisines, dietaryTypes, allergens, mode:'demo' };
export type Catalog = typeof demoCatalog;
export const photo = (id:string, width=800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
