# How to present V-Eats

## What the examiner needs to see

Show both the frontend and Oracle backend. The frontend proves connectivity and Insert, Update, Delete, Search and Display. Oracle SQL*Plus (or SQL Developer) proves schema creation, constraints, complex SELECTs, DDL, DML and TCL. The /demo web page is optional rehearsal support; it is not the only way to demonstrate SQL.

## 1. Start everything before the examiner arrives

Open Docker Desktop. In a PowerShell terminal in the V-Eats folder run:

```powershell
docker start oracle-free
npm run dev
```

Leave this terminal running. Open http://localhost:3000. Open a second PowerShell terminal in the same folder for SQL commands. Do not show `.env.local` on a projector.

## 2. Sign into management privately

The **admin key** is a generated password for the application's management screen. It is not your VIT login and not the Oracle password.

- Open `.env.local` in your editor privately.
- Find `ADMIN_TOKEN=...` and copy only the value after `=`.
- Open http://localhost:3000/manage directly and paste it into Admin key, then choose Sign in.
- The signed browser session lasts eight hours. Use Admin access in the homepage footer to open management. Open /demo directly for the optional SQL rehearsal page.

Oracle credentials are different: `ORACLE_USER`, `ORACLE_PASSWORD` and `ORACLE_CONNECT_STRING` are used only by the server and SQL helper. The SQL helper reads them automatically; no need to display or type them during the demo.

## 3. Introduce the design (about 1 minute)

Say: “V-Eats is a VIT Vellore food-discovery system. Restaurants and food items have a many-to-many relationship through Contains, which stores each restaurant's price. Food items have one category, cuisine and dietary type. Food and allergens have a many-to-many relationship through Has_Allergen.”

Show the original ER diagram, `sql/01-schema.sql`, and `docs/schema-audit.md`. Explain the two corrections to the handwritten table list: Contains needs Restaurant_ID as well as Food_ID; allergen links belong in Has_Allergen rather than a single Food_Item.Allergen_ID. Must-have is a JSON string list; location is flattened into block and landmark. Supporting photo/source fields extend the academic schema. Do not call this a byte-for-byte identical schema.

## 4. Show search and display (about 1 minute)

On the homepage, search `dosa`, open Masala Dosa and show prices at three outlets. Change a category, diet and location filter. Say once that menus/prices are sample records, while outlet locations were researched. The page deliberately avoids repeating this note on every card.

## 5. Show connected INSERT and UPDATE (about 3 minutes)

At `/manage`, create these demonstration records:

| Entity | Values |
| --- | --- |
| Restaurants | restaurant_id=`demo_r1`, restaurant_name=`Demo Canteen`, block=`GDN`, landmark=`Demo counter`, must_have=`[]`; image/source fields can be blank |
| Food items | food_id=`demo_f1`, food_name=`Demo Veg Rice`, category=`Meals`, cuisine=`Indian`, diet=`Vegetarian`; optional fields can be blank |
| Menu prices | restaurant=`demo_r1`, food=`demo_f1`, price=`90`, price_note=`Demonstration record` |

Each Save commits to Oracle. Refresh the homepage and search `Demo Veg Rice`: it appears because of the newly inserted menu relationship. Return to Menu prices, search `demo_r1`, choose Edit, change 90 to 95 and save. Refresh the homepage: the price is now 95.

## 6. Prove backend connectivity with an independent SQL session

The easiest full backend command is:

```powershell
npm run sql:demo
```

This uses the real Oracle SQL*Plus program inside the existing container. It displays SQL text and results, then runs the transaction and scratch DDL demonstrations. It reads credentials from `.env.local` without printing them. It runs predefined scripts, so it is not an interactive query prompt. Keep `sql/03-queries.sql` open beside the terminal to discuss individual queries.

If the examiner prefers SQL Developer, create a Basic connection: user `VEATS_APP`, password from `ORACLE_PASSWORD`, host `localhost`, port `1521`, Service name `FREEPDB1`. Do not use SID. Run:

```sql
SELECT restaurant_name, food_name, price
FROM menu_catalog
WHERE food_id='demo_f1';
```

It should show the new 95 price, proving that the frontend and independent backend session share Oracle data. If these demo IDs already exist from rehearsal, clean their link records first or use different IDs.

## 7. Explain at least five SELECT queries (about 4–5 minutes)

The backend runner executes all twelve reports. Concentrate on these five complex ones from `sql/03-queries.sql`:

1. **Best price for every dish:** a CTE and DENSE_RANK partitioned by food identify cheapest offers; ties are preserved.
2. **Below the restaurant average:** a correlated AVG subquery compares each price with that restaurant's average.
3. **Restaurant statistics:** joins, GROUP BY, HAVING and MIN/MAX/ROUND(AVG) summarize menus.
4. **Allergen profile:** LEFT JOIN retains dishes without listed allergens; LISTAGG and NVL create a readable list.
5. **Dishes with multiple prices:** COUNT DISTINCT and HAVING identify dishes served by multiple restaurants; MAX–MIN computes potential savings.

Also show the nested NOT EXISTS query, INTERSECT set operation and UPPER/SUBSTR/LENGTH/TO_CHAR function query to cover those explicitly. The double NOT EXISTS “every vegan dish” query currently returns no rows, because no outlet serves every vegan dish. Explain that empty result correctly.

## 8. Show constraints and DELETE (about 1–2 minutes)

Attempt to delete `demo_r1` while its menu exists. Oracle rejects deletion because Contains references it. Show the primary/foreign key definitions and the live constraint dictionary report. A duplicate key is rejected; a non-positive price is rejected by application validation and the database CHECK.

Now delete the menu row first, then `demo_f1`, then `demo_r1`. Search for the IDs to prove deletion. Refresh the homepage to show the item is gone. Keep the seeded records.

## 9. Show transactions and DDL (about 2 minutes)

The SQL runner executes `sql/04-dml-tcl.sql`:

- INSERT a reserved demonstration category and COMMIT it.
- SAVEPOINT, UPDATE, SELECT, then ROLLBACK TO the savepoint; show the original value restored.
- DELETE, show count zero, then ROLLBACK; show count one restored.
- DELETE and COMMIT; show count zero permanently for that demonstration record.

It then executes `sql/05-ddl-demo.sql` against a scratch table: CREATE, ALTER, INSERT/SELECT, TRUNCATE, and DROP. Explain that Oracle DDL commits implicitly. Do not run DDL against the actual project tables during a live presentation.

## 10. Close with evidence

Show `docs/final-project-report.md`, real outputs in `docs/oracle-outputs.md` and `docs/backend-sqlplus-output.txt`, plus integration results and the schema audit. The existing Oracle Free instance supplies the database/PDB; the project setup creates its isolated application schema. This is not a claim that a new database instance was created during the presentation.

Before submission, add group member names/contributions and compare the actual Laboratory Cycle Sheets I–VI to the query list. Those sheets have not been supplied, so exact coverage remains unverified.
