# V-Eats — VIT Vellore / Oracle SQL project

Next.js frontend and API, connected to a real local Oracle Database Free instance through node-oracledb Thin mode. All catalog reads, management changes and SQL demonstrations use the same VEATS_APP schema in FREEPDB1. MongoDB is no longer used by this app.

## Start for the demo

1. Open Docker Desktop and wait for the engine.
2. `docker start oracle-free` (the existing Oracle container on this machine).
3. `npm install` if dependencies are absent.
4. `npm run dev`.
5. Open http://localhost:3000.

The existing `.env.local` contains the Oracle connection and an admin key. Do not include it in the report or commit it. Copy its `ADMIN_TOKEN` value into the sign-in form at `/manage` or `/demo`. Admin sessions expire after eight hours. The key is not an Oracle password.

## Pages

| URL | Function |
| --- | --- |
| `/` | Oracle-backed discovery, search and category/cuisine/diet/location/allergen filters; restaurant menus; price comparison; browser favourites |
| `/manage` | Authenticated Insert, Display, Search, Update and Delete for all eight entities, including relationship updates |
| `/demo` | Twelve live predefined SELECT demonstrations, plus an isolated live transaction demonstration |
| `/sources` | Research sources and explicit data limitations |

## Setup on this machine

`npm run db:setup` creates VEATS_APP inside the existing local Oracle container using SYSDBA over docker exec. It writes random credentials into ignored `.env.local`; it does not overwrite other schemas or reset an existing password. `npm run seed` creates missing project tables and inserts missing seed records. It preserves existing records. `sql/02-seed.sql` is the generated plain SQL seed for a new empty schema and should be run only once.

For another Oracle installation, create a schema using `sql/00-create-user.sql`, configure `.env.local` from `.env.example`, then run `npm run seed`. Oracle Database Free installation supplies the FREE CDB and FREEPDB1 PDB; application setup creates a user/schema inside that PDB rather than creating a second database instance. The app user has CREATE SESSION, CREATE TABLE, CREATE VIEW and a bounded tablespace quota.

## Schema

Eight tables: RESTAURANT, FOOD_ITEM, CATEGORY, CUISINE, DIETARY_TYPE, ALLERGEN, CONTAINS, HAS_ALLERGEN. See `sql/01-schema.sql` for exact types, primary and foreign keys, uniqueness, NOT NULL and CHECK constraints. Menus and allergens have composite primary keys. A MENU_CATALOG view joins six tables. Foreign keys use restrictive deletion: delete dependent menu/allergen links first. Restaurant must-have values are a JSON string array in MUST_HAVE, preserving the supplied multivalued attribute without a ninth table. BLOCK and LANDMARK flatten the location composite attribute.

The handwritten relational list omitted RESTAURANT_ID from CONTAINS and redundantly included ALLERGEN_ID on FOOD_ITEM. This implementation follows the ER diagram: CONTAINS has both IDs; allergens are linked only through HAS_ALLERGEN. Lookup IDs are human-readable strings and their names currently equal IDs. Optional photo/source/description fields extend the original academic schema.

## Data

Five researched VIT outlet locations, twelve sample dishes, twenty-three sample restaurant prices and twelve sample allergen links. All menu items/prices/dietary and allergen classifications are demonstration data. Current campus menus and prices could not be verified. Source URLs are stored with outlets and documented in `/sources` and `docs/data-sources.md`. Images are illustrative Unsplash photos. Ratings and preparation times are not fabricated or displayed. The interface uses a readable Arial/Helvetica sans-serif stack. The custom display fonts are no longer used.

## Verification and submission artifacts

```powershell
npm run build
npm run typecheck
npm test
npm run db:capture
 npm run db:audit
 npm run sql:demo
```

The app must run for `npm test`. It tests every entity, all four write/read operations, commit visibility, rollback, FK/PK constraints and all live reports, then removes its unique temporary records. `db:capture` executes SELECT, DDL, DML and TCL statements and captures real Oracle output in `docs/oracle-outputs.md` and `.json`. It creates/drops only a dedicated scratch table and cleans its own transaction record.

- `docs/submission-checklist.md`: exact requirements/status and group module suggestions.
- `docs/demo-guide.md`: presentation walkthrough.
- `docs/final-project-report.md`: report draft with executed SQL and outputs; add group member names and exact lab-sheet mapping before submission.
- `docs/integration-results.md`: API/Oracle integration evidence.
- `sql/00-create-user.sql` through `sql/05-ddl-demo.sql`: SQL implementation and SQL*Plus-compatible demonstration scripts.

Exact coverage of Laboratory Cycle Sheets I–VI is pending those sheets. No claim is made that every unseen lab exercise is covered. End-user accounts, ordering, payment and deployment are outside this food-discovery database project. Saved dishes are localStorage, not a database user module.
