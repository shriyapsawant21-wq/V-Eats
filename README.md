# V-Eats

A responsive campus food discovery mockup built with Next.js App Router, TypeScript, React and MongoDB. Includes search, category/cuisine/diet/location filters, allergen exclusions, persistent browser favourites, restaurant menus, dish details and price comparisons.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000. No database is required for the seeded demo. Restaurant names, ratings, timings, menus and allergen information are fictional sample content. Photography is loaded from Unsplash; fonts load from Google Fonts.

## Connect MongoDB

Copy `.env.example` to `.env.local`, then set `MONGODB_URI` to a local MongoDB instance or Atlas connection string. Keep credentials out of Git. Seed the connected database (Node 22.6+):

```powershell
node --env-file=.env.local --experimental-strip-types scripts/seed.ts
```

Restart the app after changing environment variables. Seeding creates unique indexes and inserts missing example records without overwriting existing records. With a configured but unavailable database the API returns HTTP 503; the UI explicitly reports the failure and displays sample data.

## Schema mapping

| Original entity | MongoDB collection | Fields / relationships |
| --- | --- | --- |
| Restaurant | restaurants | id, name, block, landmark, mustHave[] |
| Food_Item | foods | id, name, categoryId, cuisineId, dietaryTypeId |
| Contains | contains | restaurantId + foodId (unique pair), price in INR |
| Category | categories | id, name |
| Cuisine | cuisines | id, name |
| Dietary_Type | dietaryTypes | id, name |
| Allergen | allergens | id, name |
| Has_Allergen | hasAllergen | foodId + allergenId (unique pair) |

Category, cuisine and dietary type each have a one-to-many relationship with food. Restaurants and foods have a many-to-many relationship through Contains. Foods and allergens have a many-to-many relationship through Has_Allergen; no duplicate allergen foreign key is stored on Food_Item. Human-readable lookup IDs are used consistently in this mockup. MongoDB references are application-managed, not SQL foreign keys. Presentation fields such as images, descriptions, ratings and preparation times extend the supplied schema.

## Backend endpoints

- `GET /api/catalog`: full catalog and demo/MongoDB mode.
- `GET /api/restaurants`: restaurant directory.
- `GET /api/foods?q=paneer`: searchable food list.

This is a discovery prototype. Ordering, payments, authentication and restaurant administration are not implemented. Favourites are stored on this browser. Allergy data must be confirmed with the restaurant.

## Validation

```powershell
npm run build
npm run typecheck
```
