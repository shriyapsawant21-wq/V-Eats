# Submission requirements and implemented scope

## Status against the supplied assignment screenshots

| Requirement | Implementation / evidence | Status |
| --- | --- | --- |
| Oracle SQL database | Oracle Database Free, FREEPDB1 PDB, VEATS_APP schema, local Docker storage | Implemented and connected |
| Database creation | Existing Oracle Free instance supplies CDB/PDB; setup creates isolated app schema; manual script 00-create-user.sql | Implemented schema setup; existing database reused |
| Table creation | Eight tables and MENU_CATALOG view in 01-schema.sql | Executed |
| Integrity constraints | PK, composite PK, FK, NOT NULL, UNIQUE, positive bounded price CHECK, JSON CHECK; live dictionary reports | Executed and tested |
| Data population | 5 outlets, 12 food items, 23 menus, 12 food-allergen links, 4 categories, 4 cuisines, 3 diets, 5 allergens | Executed |
| DDL statements | CREATE TABLE, ALTER TABLE, TRUNCATE, DROP, CREATE INDEX, CREATE VIEW | Scripts plus real captured outputs |
| DML | INSERT, UPDATE, DELETE through management UI/API and SQL scripts | Executed and tested |
| TCL | COMMIT after writes; ROLLBACK on failures; SAVEPOINT and ROLLBACK TO in live transaction demo and scripts | Executed and tested |
| Frontend connectivity | Next.js API → node-oracledb Thin driver → Oracle connection pool → shared schema | Implemented, browser and API tested |
| Insert, Update, Delete, Search, Display | Authenticated /manage page for all eight entities; FK dropdowns; search; edit; delete confirmation | Implemented |
| Five SELECT queries including complex/nested/functions | Ten application SELECT reports plus two data dictionary reports in /demo | Implemented and executed |
| Complex queries in demonstration | CTE + DENSE_RANK; correlated AVG; NOT EXISTS; double NOT EXISTS; GROUP BY/HAVING; LISTAGG; INTERSECT | Implemented and executed |
| Corresponding outputs in final report | docs/oracle-outputs.md/json and report draft | Included |
| Lab Cycle Sheets I–VI exercises | Actual sheets have not been supplied | Exact matching cannot be certified |
| Group activity / module assignment | Suggested modules below; member names not supplied | Add names before submission |

## Suggested member modules

1. Restaurant and menu module: RESTAURANT/CONTAINS, CRUD, joins, cheapest-offer ranking and correlated restaurant-average query.
2. Food classification module: FOOD_ITEM/CATEGORY/CUISINE/DIETARY_TYPE, CRUD, INTERSECT and grouped statistics.
3. Allergen module: ALLERGEN/HAS_ALLERGEN, CRUD, NOT EXISTS anti-join and LISTAGG profile.
4. Integrity and transaction module: constraints/data dictionary, SAVEPOINT/ROLLBACK/COMMIT, deletion restrictions, DDL scratch demonstrations.

For each member, record their actual demonstrated INSERT, UPDATE, DELETE and SELECT queries. Do not claim individual work not performed.

## What is intentionally sample or outside scope

- Outlet locations are source-backed, historical/publicly documented locations. Current opening status is unverified.
- All menu availability, prices, diet and allergen data are sample records; not scraped verified campus price lists.
- Photos are illustrative; no invented ratings, delivery times or live stock indicators.
- Admin access uses a shared local key with an eight-hour signed HTTP-only cookie; not a multi-user identity system.
- Favourites persist on the browser; no ordering/payment/cart module.
- Requires Docker's Oracle container and Next.js server running. Not deployed.
- The interface uses a standard readable sans-serif font. Custom uploaded display fonts are not used.

