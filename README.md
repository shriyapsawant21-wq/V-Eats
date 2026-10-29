# V-Eats — VIT Vellore / Oracle SQL project

Next.js frontend and backend connected to local Oracle Database Free through node-oracledb. Discovery, management and SQL demonstrations use the same VEATS_APP schema in FREEPDB1. Each teammate runs an independent local database: Git copies code and seed scripts, not another laptop's running database or passwords.

## First-time setup for teammates

### 1. Install prerequisites

- [Git](https://git-scm.com/downloads).
- [Node.js 24 LTS](https://nodejs.org/), including npm; this is the version tested with this project.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), or Docker Engine on Linux.

Start Docker Desktop using Linux containers. Complete Docker's WSL 2/virtualization setup on Windows if prompted, and allocate sufficient memory/disk space for Oracle. The commands below work in PowerShell, macOS Terminal and Linux shells. The project was verified on Windows; individual teammate machines have not all been tested. Java, MongoDB and Oracle Instant Client are not needed. SQL Developer is optional.

```sh
git --version
node --version
npm --version
docker info
```

### 2. Clone dev and install dependencies

```sh
git clone --branch dev https://github.com/shriyapsawant21-wq/V-Eats.git
cd V-Eats
npm ci
```

Already cloned? Preserve local edits, then run `git switch dev`, `git pull --ff-only origin dev`, and `npm ci`. Run all subsequent npm commands inside the V-Eats folder.

### 3. Create Oracle once on a fresh laptop

Check existing containers with `docker ps -a`. If a compatible project container named `oracle-free` and its matching `.env.local` already exist, use the daily-start instructions instead. Otherwise run this **single-line** command:

```sh
docker run -d --name oracle-free --restart unless-stopped -p 127.0.0.1:1521:1521 -e ORACLE_RANDOM_PASSWORD=yes -v veats-oracle-data:/opt/oracle/oradata --health-cmd healthcheck.sh --health-interval 10s --health-timeout 5s --health-retries 30 --health-start-period 120s gvenzl/oracle-free:23.26.2-slim
```

The pinned image matches the project's tested Oracle version. The image family supports Intel/AMD and Apple Silicon. Data persists in the named Docker volume across restarts. The first download and database startup can take several minutes.

Check readiness until the status is `healthy`:

```sh
docker inspect --format "{{.State.Health.Status}}" oracle-free
```

You can also check:

```sh
docker exec oracle-free healthcheck.sh
```

Proceed only when it exits successfully. Startup logs can diagnose failures, but the image prints its generated SYS/SYSTEM password during initialization; do not share those logs publicly. Container flags follow the [image maintainer's documentation](https://github.com/gvenzl/oci-oracle-free).

### 4. Create your schema, local credentials and sample data

```sh
npm run db:setup
npm run seed
npm run db:audit
```

- `db:setup` creates VEATS_APP inside FREEPDB1 and generates your own Oracle application password and admin key in ignored `.env.local`.
- For this Docker path, do **not** copy placeholder values from `.env.example` first; let setup generate real credentials.
- `seed` creates the eight tables and inserts missing sample records while preserving existing records.
- `db:audit` checks the live schema against the project's ER mapping.

Expected initial data: 5 restaurants, 12 dishes, 23 menu prices and 12 food-allergen links. Do not also run `sql/02-seed.sql` after `npm run seed`; that plain SQL file is for a new empty schema. Keep `.env.local` safe because an existing database volume needs its matching credentials.

### 5. Start the website

```sh
npm run dev
```

Keep that terminal open. Visit http://localhost:3000, or the Local URL printed by Next.js if port 3000 is occupied.

### 6. Open admin access

Click **Admin access** in the homepage footer, or open http://localhost:3000/manage.

1. Open your own `.env.local` privately in an editor.
2. Copy only the value after `ADMIN_TOKEN=`.
3. Paste it into **Admin key** and choose **Sign in**.

This key is the application's management password, separate from the Oracle password and your VIT login. Each laptop has its own key. Sessions last eight hours. Never commit `.env.local`, passwords or screenshots containing credentials.

For restaurants, ID, name, block and landmark are required. Other fields are optional. Must-have dishes accept ordinary comma-separated names such as `Dosa, Coffee`, or a JSON string list. A supplied source URL must start with http:// or https://.

## Daily startup and stopping

Start Docker Desktop, open a terminal inside V-Eats, then run:

```sh
docker start oracle-free
```

Wait for the readiness check above, then:

```sh
npm run dev
```

There is no need to recreate the container, regenerate credentials or reseed every time. After pulling dependency changes, rerun `npm ci`. Press Ctrl+C to stop Next.js. Optionally run `docker stop oracle-free`; database records remain in the volume. Do not delete that volume as a routine troubleshooting step.

## Run the submission demonstration

Show both frontend connectivity and backend SQL:

1. Start the website. Search/display food, then use `/manage` to Insert, Update and Delete temporary records. Refresh Discover to show committed changes.
2. Open a **second terminal inside V-Eats**, leaving `npm run dev` running, and execute:

```sh
npm run sql:demo
```

This runs real Oracle SQL*Plus inside `oracle-free`. It reads credentials automatically without printing them, displays complex query text/results, and runs DML/TCL and scratch-table DDL demonstrations. It is an automated script runner, not an interactive SQL prompt. Keep `sql/03-queries.sql` open while explaining individual queries. Run one backend demonstration at a time because scripts share reserved demonstration names.

Optional browser rehearsal: http://localhost:3000/demo, using the same admin key. Follow [the ordered demo guide](docs/demo-guide.md) for exact example values, explanations and presentation order.

For an independent SQL Developer connection:

| Setting | Value |
| --- | --- |
| Username | VEATS_APP |
| Password | Your ORACLE_PASSWORD from .env.local |
| Host | localhost |
| Port | 1521 |
| Connection identifier | **Service name** FREEPDB1, not SID |

## Pages

| URL | Function |
| --- | --- |
| `/` | Discovery, filters, restaurant menus, prices and browser favourites |
| `/manage` | Authenticated Insert, Display, Search, Update and Delete for all eight entities |
| `/demo` | Twelve live SELECT demonstrations and a transaction demonstration |
| `/sources` | Research sources and data limitations |

## Checks, reports and teammate workflow

With Oracle and the website running, use a second terminal:

```sh
npm test
npm run test:restaurant
npm run db:audit
```

Tests remove their temporary records. Build/type checks:

```sh
npm run build
npm run typecheck
```

Generate fresh Oracle execution evidence and rebuild the report draft:

```sh
npm run db:capture
npm run report
```

These commands regenerate tracked evidence files with this laptop's data/timestamps, so `git status` can show modified files afterward. Committed outputs document the author's run. Each laptop has separate data: pushing code does not push database edits. Reproducible population is in `scripts/seed-oracle.ts` and `sql/02-seed.sql`. Share code through Git and keep local credentials private.

## Troubleshooting

| Problem | Action |
| --- | --- |
| Docker daemon/pipe unavailable | Start Docker Desktop, wait for its engine, then retry `docker info`. |
| Container name already exists | Inspect/reuse the compatible existing `oracle-free`; do not repeat `docker run` or delete someone else's data. |
| Port 1521 occupied | Reuse the compatible Oracle installation, or create the container with host port 1522, then change ORACLE_CONNECT_STRING to `127.0.0.1:1522/FREEPDB1` after db:setup and before seeding. Internal container port stays 1521. |
| Oracle unavailable / connection refused | Check that the container runs, wait for healthcheck.sh to pass, and verify ORACLE_CONNECT_STRING. |
| ORA-01017 / invalid login | Recover the .env.local matching the database volume. Setup preserves existing users and does not reset an existing password. |
| Admin key rejected | Use this laptop's ADMIN_TOKEN, not ORACLE_PASSWORD or a teammate's key. Restart Next.js if you changed .env.local. |
| Empty catalog | Run seed after schema setup, then refresh. Inspect `/api/catalog` for availability errors. |
| Restaurant save rejected | Fill the four required fields, use unique IDs/names, and read the specific validation message. |
| Parent deletion blocked | Delete dependent Contains / Has_Allergen rows before their referenced parents. |
| Website starts on 3001 | Use its printed URL. Tests default to 3000; set VEATS_BASE_URL to the actual URL. |
| Images missing | Unsplash photos require internet; SQL/database functionality does not depend on them. |

For tests on port 3001, PowerShell uses `$env:VEATS_BASE_URL="http://localhost:3001"`; macOS/Linux uses `export VEATS_BASE_URL=http://localhost:3001`. Then run test commands normally.

## Using a different existing Oracle installation

Automatic `db:setup` and `sql:demo` target a container named `oracle-free`. For another Oracle installation, have your DBA run `sql/00-create-user.sql`, configure `.env.local` from `.env.example` with real credentials and a long random ADMIN_TOKEN, then run `npm run seed`. Use that installation's SQL Developer/SQL*Plus for the SQL scripts instead of `npm run sql:demo`.

Thin mode does not need Oracle Instant Client. Oracle Free installation supplies the FREE database and FREEPDB1 PDB; project setup creates an isolated application schema within the PDB, not a second database instance.

## Schema and data

Eight tables: RESTAURANT, FOOD_ITEM, CATEGORY, CUISINE, DIETARY_TYPE, ALLERGEN, CONTAINS and HAS_ALLERGEN. `sql/01-schema.sql` defines types, PKs, composite PKs, FKs, NOT NULL, UNIQUE and CHECK constraints, indexes and MENU_CATALOG view. Deletion is restrictive. Location is flattened into BLOCK/LANDMARK; MUST_HAVE is a JSON string array.

The handwritten table list omitted RESTAURANT_ID from CONTAINS and redundantly included ALLERGEN_ID on FOOD_ITEM. The implementation follows the ER relationships and documents these corrections, supporting fields and minimum-participation qualifications in [the live schema audit](docs/schema-audit.md).

Outlet locations are researched; all dishes, prices and dietary/allergen classifications are academic sample data. Photos are illustrative. Fonts use readable Arial/Helvetica; unused uploaded fonts are excluded from Git. Favourites are browser localStorage. Multi-user accounts, ordering, payment and public deployment are outside scope.

## Submission artifacts

- [Requirements checklist](docs/submission-checklist.md)
- [Ordered demo guide](docs/demo-guide.md)
- [Report draft with actual Oracle outputs](docs/final-project-report.md)
- [Integration results](docs/integration-results.md)
- [Oracle outputs](docs/oracle-outputs.md) and [SQL*Plus transcript](docs/backend-sqlplus-output.txt)
- [Schema audit](docs/schema-audit.md) and [data sources](docs/data-sources.md)
- `sql/00-create-user.sql` through `sql/05-ddl-demo.sql`: implementation and SQL demonstrations

Add group member details and original ER diagrams before submission. Exact Laboratory Cycle Sheets I–VI coverage remains pending those sheets; no claim is made that unseen lab exercises are covered.
