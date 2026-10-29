const stmt=(title,sql,why,expected)=>({title,sql,why,expected});
export const members=[
 {name:'Shriya',slug:'shriya',module:'Restaurants',tables:['RESTAURANT'],entityLines:[2],schemaLines:'5 to 11',catalogLines:'5 and 9',reportLines:[6,11],ids:['SHRIYA_R'],
 introduction:'I manage restaurant identity and campus location. Restaurant is the parent of Contains. A restaurant can list many dishes, while a dish can be listed by many restaurants through Contains.',
 columns:'RESTAURANT_ID is the primary key. RESTAURANT_NAME is required and unique. BLOCK and LANDMARK store the location. MUST_HAVE is a JSON string list. Image, source and timestamp columns support the application.',
 prerequisites:'The seeded database must exist. This module creates only SHRIYA_R and does not need any other member to run first.',
 writes:[
 stmt('Insert your demonstration restaurant',`INSERT INTO restaurant
 (restaurant_id, restaurant_name, block, landmark, must_have)
VALUES ('SHRIYA_R', 'Shriya Demo Canteen', 'GDN',
 'Demo counter', '["Dosa", "Coffee"]')`, 'Create one parent restaurant record. The dish names inside MUST_HAVE are text, not foreign keys.', '1 row created.'),
 stmt('Commit the insert','COMMIT','Make the insert visible to other database sessions.','Commit complete.'),
 stmt('Update its location',`UPDATE restaurant
SET landmark = 'Updated demo counter'
WHERE restaurant_id = 'SHRIYA_R'`,'The WHERE clause prevents an accidental update of every restaurant.','1 row updated.'),
 stmt('Commit the update','COMMIT','Persist the new landmark.','Commit complete.')],
 selects:[
 stmt('S1 Display and search your record',`SELECT restaurant_id, restaurant_name, block, landmark
FROM restaurant
WHERE restaurant_id = 'SHRIYA_R'`, 'A primary-key search displays exactly the inserted record and updated landmark.', 'One row; landmark is Updated demo counter.'),
 stmt('S2 Summarize menus including empty restaurants',`SELECT r.restaurant_name, COUNT(m.food_id) AS dishes,
       ROUND(AVG(m.price), 2) AS avg_price
FROM restaurant r
LEFT JOIN contains m ON m.restaurant_id = r.restaurant_id
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY r.restaurant_name`, 'LEFT JOIN retains restaurants with no menu. COUNT(column) ignores the NULL child row; AVG is NULL for an empty menu.', 'Your demo restaurant has 0 dishes and NULL average; seeded outlets have menus.'),
 stmt('S3 Find outlets below the overall menu average',`SELECT r.restaurant_name
FROM restaurant r
WHERE EXISTS (
 SELECT 1 FROM contains m
 WHERE m.restaurant_id = r.restaurant_id
 AND m.price < (SELECT AVG(price) FROM contains)
)
ORDER BY r.restaurant_name`, 'A correlated EXISTS tests each restaurant. The nested AVG subquery supplies a database-wide comparison.', 'Only restaurants with at least one below-average offer appear.'),
 stmt('S4 Format the directory using SQL functions',`SELECT UPPER(restaurant_name) AS outlet,
       SUBSTR(landmark, 1, 28) AS location,
       LENGTH(restaurant_name) AS name_length
FROM restaurant
ORDER BY restaurant_name`, 'UPPER changes display case, SUBSTR shortens a value, and LENGTH counts its characters. Stored names are unchanged.', 'All restaurants appear with uppercase display names and character counts.'),
 stmt('S5 Find restaurants serving both Indian and vegetarian food',`SELECT r.restaurant_name
FROM restaurant r
WHERE r.restaurant_id IN (
 SELECT m.restaurant_id FROM contains m
 JOIN food_item f ON f.food_id = m.food_id
 WHERE f.cuisine_id = 'Indian'
 INTERSECT
 SELECT m.restaurant_id FROM contains m
 JOIN food_item f ON f.food_id = m.food_id
 WHERE f.dietary_type_id = 'Vegetarian'
)
ORDER BY r.restaurant_name`, 'INTERSECT returns restaurant IDs present in both sets. The two qualifying dishes can be different dishes.', 'Outlets must satisfy both set conditions; an empty restaurant does not qualify.')],
 deletes:[stmt('Delete only your restaurant',`DELETE FROM restaurant WHERE restaurant_id = 'SHRIYA_R'`,'No menu references this independent demonstration record, so its deletion is allowed.','1 row deleted.'),stmt('Commit the deletion','COMMIT','Make cleanup permanent.','Commit complete.'),stmt('Verify cleanup',`SELECT COUNT(*) AS remaining FROM restaurant
WHERE restaurant_id = 'SHRIYA_R'`,'Count the specific ID, not the entire table.','REMAINING = 0.')],
 viva:[['Why not store price in Restaurant?','Price belongs to a restaurant–food pair, so it is in Contains.'],['Why LEFT JOIN in S2?','It retains a restaurant even when it currently has no menu rows.'],['Is MUST_HAVE normalized into another table?','No. It is a JSON string list on Restaurant, matching the supplied table list storage choice.'],['Why can deleting a seeded restaurant fail?','Contains rows reference it through a foreign key; child rows must be deleted first.']],
 reportExplanation:'Restaurant statistics in lib/reports.ts are existing application examples. Your five independent rehearsal SELECTs are in sql/members/shriya.sql.'},
 {name:'Trisha',slug:'trisha',module:'Food items',tables:['FOOD_ITEM'],entityLines:[3],schemaLines:'12 to 20',catalogLines:'5 and 10',reportLines:[5,10],ids:['TRISHA_F'],
 introduction:'I manage dish identity and classification. Food_Item references one category, one cuisine and one dietary type. Restaurant prices and allergen links are separate relationships.',
 columns:'FOOD_ID is the primary key. FOOD_NAME is required. CATEGORY_ID, CUISINE_ID and DIETARY_TYPE_ID are required foreign keys. DESCRIPTION and IMAGE are optional application fields.',
 prerequisites:'Existing seeded lookup IDs Meals, Indian and Vegetarian are required. The script creates only TRISHA_F; it does not depend on another member.',
 writes:[stmt('Insert your dish',`INSERT INTO food_item
 (food_id, food_name, category_id, cuisine_id,
  dietary_type_id, description)
VALUES ('TRISHA_F', 'Trisha Demo Rice', 'Meals', 'Indian',
 'Vegetarian', 'Dish for the database demonstration')`,'All three classification IDs must already exist. Do not invent an unseeded lookup ID.','1 row created.'),stmt('Commit the insert','COMMIT','Persist the dish.','Commit complete.'),stmt('Update its description',`UPDATE food_item
SET description = 'Updated vegetarian rice description'
WHERE food_id = 'TRISHA_F'`,'Change a non-key field while retaining the identity and valid references.','1 row updated.'),stmt('Commit the update','COMMIT','Persist the edit.','Commit complete.')],
 selects:[
 stmt('S1 Search your dish and verify the update',`SELECT food_id, food_name, description
FROM food_item
WHERE food_id = 'TRISHA_F'`,'A simple SELECT verifies the insert and updated description.','One row with Updated vegetarian rice description.'),
 stmt('S2 Display classification names with four tables',`SELECT f.food_name, c.category_name, u.cuisine_name,
       d.type_name
FROM food_item f
JOIN category c ON c.category_id = f.category_id
JOIN cuisine u ON u.cuisine_id = f.cuisine_id
JOIN dietary_type d ON d.dietary_type_id = f.dietary_type_id
ORDER BY f.food_name`,'Joins follow the three foreign keys rather than duplicating lookup names in Food_Item.','Your dish appears as Meals, Indian, Vegetarian.'),
 stmt('S3 Find dishes with an affordable offer',`SELECT f.food_name
FROM food_item f
WHERE EXISTS (
 SELECT 1 FROM contains m
 WHERE m.food_id = f.food_id AND m.price < 100
)
ORDER BY f.food_name`,'Correlated EXISTS returns a dish once even if several restaurants offer it below 100.','Only dishes with a listed price below 100 qualify; your unlisted demo dish does not.'),
 stmt('S4 Count dishes by category and diet',`SELECT category_id, dietary_type_id, COUNT(*) AS dishes
FROM food_item
GROUP BY category_id, dietary_type_id
HAVING COUNT(*) >= 2
ORDER BY category_id, dietary_type_id`,'GROUP BY forms category/diet groups; HAVING filters aggregate counts after grouping.','Only groups containing at least two dishes appear.'),
 stmt('S5 Find food without a menu using MINUS',`SELECT food_id, food_name FROM food_item
MINUS
SELECT f.food_id, f.food_name
FROM food_item f JOIN contains m ON m.food_id = f.food_id
ORDER BY food_name`,'MINUS removes listed dishes from all dishes. This also explains why merely inserting Food_Item does not make it discoverable in a restaurant menu.','TRISHA_F appears because it has no Contains row.')],
 deletes:[stmt('Delete only your unlisted dish',`DELETE FROM food_item WHERE food_id = 'TRISHA_F'`,'Your record has no menu/allergen children. Do not delete seed dishes.','1 row deleted.'),stmt('Commit the deletion','COMMIT','Persist cleanup.','Commit complete.'),stmt('Verify cleanup',`SELECT COUNT(*) AS remaining FROM food_item
WHERE food_id = 'TRISHA_F'`,'Verify your ID is gone.','REMAINING = 0.')],
 viva:[['Why can a foreign-key value not be invented?','Oracle requires the referenced lookup record to exist.'],['Why is my new dish absent from the homepage?','Discovery shows restaurant offers; add a Contains relationship to list it at an outlet.'],['WHERE versus HAVING?','WHERE filters individual rows before grouping; HAVING filters aggregate groups.'],['Why no ALLERGEN_ID on Food_Item?','The ER diagram allows many allergens, represented by Has_Allergen.']],
 reportExplanation:'Food search is in app/api/foods/route.ts. Existing nested food examples are in lib/reports.ts. Your five demonstration SELECTs are in sql/members/trisha.sql.'},
 {name:'Tanisi',slug:'tanisi',module:'Categories cuisines and dietary types',tables:['CATEGORY','CUISINE','DIETARY_TYPE'],entityLines:[6,7,8],schemaLines:'2 to 4 and 14 to 16',catalogLines:'7 to 8 and 13',reportLines:[9,10],ids:['TANISI_C','TANISI_U','TANISI_D'],
 introduction:'I manage the three classification lookup tables. Each lookup record can classify many food items, and every food item must reference one valid category, cuisine and dietary type.',
 columns:'CATEGORY has CATEGORY_ID and CATEGORY_NAME. CUISINE has CUISINE_ID and CUISINE_NAME. DIETARY_TYPE has DIETARY_TYPE_ID and TYPE_NAME. Each ID is a primary key and each name is required and unique.',
 prerequisites:'This module uses existing Food_Item rows for SELECTs but creates its own three unused lookup records. No member must run before you.',
 writes:[stmt('Insert one record into each owned table',`INSERT INTO category VALUES ('TANISI_C', 'Tanisi Demo Category');
INSERT INTO cuisine VALUES ('TANISI_U', 'Tanisi Demo Cuisine');
INSERT INTO dietary_type VALUES ('TANISI_D', 'Tanisi Demo Diet')`,'These are three INSERT statements. They intentionally have no child food rows, so cleanup can be done independently.','Three separate 1 row created messages.'),stmt('Commit the inserts','COMMIT','Persist all three in one transaction.','Commit complete.'),stmt('Update all three lookup names',`UPDATE category SET category_name = 'Tanisi Category Updated'
WHERE category_id = 'TANISI_C';
UPDATE cuisine SET cuisine_name = 'Tanisi Cuisine Updated'
WHERE cuisine_id = 'TANISI_U';
UPDATE dietary_type SET type_name = 'Tanisi Diet Updated'
WHERE dietary_type_id = 'TANISI_D'`,'IDs remain stable while display names change. The API maps IDs to the current display names.','Three separate 1 row updated messages.'),stmt('Commit the updates','COMMIT','Persist the three edits.','Commit complete.')],
 selects:[
 stmt('S1 Verify all three updates using UNION ALL',`SELECT 'Category' AS kind, category_id AS id,
       category_name AS name FROM category
WHERE category_id = 'TANISI_C'
UNION ALL
SELECT 'Cuisine', cuisine_id, cuisine_name FROM cuisine
WHERE cuisine_id = 'TANISI_U'
UNION ALL
SELECT 'Diet', dietary_type_id, type_name FROM dietary_type
WHERE dietary_type_id = 'TANISI_D'`,'UNION ALL combines compatible columns without removing duplicates. Labels identify the source entity.','Three rows with the Updated names.'),
 stmt('S2 Count food in every category',`SELECT c.category_name, COUNT(f.food_id) AS dishes
FROM category c LEFT JOIN food_item f
 ON f.category_id = c.category_id
GROUP BY c.category_id, c.category_name
ORDER BY dishes DESC, c.category_name`,'LEFT JOIN includes unused categories; COUNT(f.food_id) makes the empty category count zero.','Tanisi Category Updated has 0 dishes.'),
 stmt('S3 Find cuisines with more than one dish',`SELECT c.cuisine_name, COUNT(f.food_id) AS dishes
FROM cuisine c JOIN food_item f
 ON f.cuisine_id = c.cuisine_id
GROUP BY c.cuisine_id, c.cuisine_name
HAVING COUNT(f.food_id) > 1
ORDER BY dishes DESC`,'An aggregate join with HAVING identifies commonly used cuisines.','Only cuisines associated with at least two dishes appear.'),
 stmt('S4 Find unused dietary types',`SELECT d.type_name
FROM dietary_type d
WHERE NOT EXISTS (
 SELECT 1 FROM food_item f
 WHERE f.dietary_type_id = d.dietary_type_id
)
ORDER BY d.type_name`,'A correlated NOT EXISTS implements an anti-join: select parents with no children.','Tanisi Diet Updated appears; other unused types may also appear.'),
 stmt('S5 Find Indian meals with INTERSECT',`SELECT food_name FROM food_item WHERE cuisine_id = 'Indian'
INTERSECT
SELECT food_name FROM food_item WHERE category_id = 'Meals'
ORDER BY food_name`,'The result belongs to both sets. INTERSECT removes duplicates and requires compatible selected column types.','Only dish names that are both Indian and Meals appear.')],
 deletes:[stmt('Delete only your three unused lookups',`DELETE FROM category WHERE category_id = 'TANISI_C';
DELETE FROM cuisine WHERE cuisine_id = 'TANISI_U';
DELETE FROM dietary_type WHERE dietary_type_id = 'TANISI_D'`,'No food references these temporary IDs. Deleting a referenced real lookup would be rejected.','Three separate 1 row deleted messages.'),stmt('Commit cleanup','COMMIT','Persist all three deletions.','Commit complete.'),stmt('Verify cleanup',`SELECT
 (SELECT COUNT(*) FROM category WHERE category_id='TANISI_C')
 + (SELECT COUNT(*) FROM cuisine WHERE cuisine_id='TANISI_U')
 + (SELECT COUNT(*) FROM dietary_type
    WHERE dietary_type_id='TANISI_D') AS remaining
FROM dual`,'Scalar subqueries add remaining counts; DUAL supplies one result row.','REMAINING = 0.')],
 viva:[['Why separate lookup tables?','They centralize classification names and allow foreign-key integrity instead of inconsistent repeated text.'],['Is All food a category record?','No. It is a frontend filter option only.'],['Can I delete Meals while food references it?','No. The restrictive FK prevents deletion until child references are changed or removed.'],['UNION ALL versus INTERSECT?','UNION ALL concatenates results; INTERSECT returns values common to both sets.']],
 reportExplanation:'The three table definitions are at the start of sql/01-schema.sql. Your module has three entity entries but shares the same generic CRUD handler. Demonstration SQL is sql/members/tanisi.sql.'},
 {name:'Asmi',slug:'asmi',module:'Allergens and food allergen links',tables:['ALLERGEN','HAS_ALLERGEN'],entityLines:[5,9],schemaLines:'5 and 28 to 32',catalogLines:'6, 8 and 12 to 13',reportLines:[5,7],ids:['ASMI_A'],
 introduction:'I manage allergen definitions and the many-to-many food–allergen relationship. Has_Allergen stores one pair per link, allowing each food to have multiple allergens and each allergen to appear in multiple foods.',
 columns:'ALLERGEN_ID is the Allergen primary key. ALLERGEN_NAME is required and unique. Has_Allergen has composite primary key (FOOD_ID, ALLERGEN_ID); both columns also reference parent tables.',
 prerequisites:'Seed dishes f7 and f9 must exist. ASMI_A is your own temporary allergen, so none of your statements edits the seeded allergen links.',
 writes:[stmt('Insert a parent allergen and its link',`INSERT INTO allergen VALUES ('ASMI_A', 'Asmi Demo Allergen');
INSERT INTO has_allergen(food_id, allergen_id)
VALUES ('f7', 'ASMI_A')`,'Insert the parent before the relationship because of the FK. Linking f7 to a demo allergen is a demonstration, not a real allergy claim.','Two separate 1 row created messages.'),stmt('Commit the inserts','COMMIT','Make both parent and relationship visible.','Commit complete.'),stmt('Update the name and relationship',`UPDATE allergen SET allergen_name = 'Asmi Allergen Updated'
WHERE allergen_id = 'ASMI_A';
UPDATE has_allergen SET food_id = 'f9'
WHERE food_id = 'f7' AND allergen_id = 'ASMI_A'`,'The master name changes; the link moves from f7 to f9. Both columns identify the original relationship in the WHERE clause.','Two separate 1 row updated messages.'),stmt('Commit the updates','COMMIT','Persist both edits.','Commit complete.')],
 selects:[
 stmt('S1 Display the updated relationship',`SELECT f.food_name, a.allergen_name
FROM has_allergen h
JOIN food_item f ON f.food_id = h.food_id
JOIN allergen a ON a.allergen_id = h.allergen_id
WHERE h.allergen_id = 'ASMI_A'`,'A three-table join follows both FKs. It verifies the updated master name and changed food ID.','Idli Sambar linked to Asmi Allergen Updated.'),
 stmt('S2 List allergen names for every food',`SELECT f.food_name,
 NVL(LISTAGG(a.allergen_name, ', ')
 WITHIN GROUP (ORDER BY a.allergen_name), 'None listed')
 AS listed_allergens
FROM food_item f
LEFT JOIN has_allergen h ON h.food_id = f.food_id
LEFT JOIN allergen a ON a.allergen_id = h.allergen_id
GROUP BY f.food_id, f.food_name
ORDER BY f.food_name`,'LEFT JOIN retains foods without links. LISTAGG combines names, and NVL provides a display value when the aggregate is NULL.','All food appears; your temporary label is included for Idli Sambar.'),
 stmt('S3 Find vegetarian food without listed milk',`SELECT f.food_name
FROM food_item f
WHERE f.dietary_type_id IN ('Vegetarian', 'Vegan')
AND NOT EXISTS (
 SELECT 1 FROM has_allergen h
 WHERE h.food_id = f.food_id AND h.allergen_id = 'Milk'
)
ORDER BY f.food_name`,'The correlated anti-join excludes foods with a Milk link. Absence of a sample link does not certify medical safety.','Only vegetarian/vegan foods with no listed Milk relationship appear.'),
 stmt('S4 Find foods with several listed allergens',`SELECT f.food_name, COUNT(*) AS allergen_count
FROM food_item f JOIN has_allergen h ON h.food_id=f.food_id
GROUP BY f.food_id, f.food_name
HAVING COUNT(*) >= 2
ORDER BY allergen_count DESC, f.food_name`,'GROUP BY counts links per food, and HAVING keeps foods with two or more.','Examples include pizza, brownie and chicken noodles in the seed data.'),
 stmt('S5 Find foods sharing allergens with pizza',`SELECT f.food_name
FROM food_item f
WHERE f.food_id <> 'f2'
AND EXISTS (
 SELECT 1 FROM has_allergen h
 WHERE h.food_id = f.food_id
 AND h.allergen_id IN (
  SELECT allergen_id FROM has_allergen WHERE food_id='f2'
 )
)
ORDER BY f.food_name`,'An IN subquery gets pizza allergens; correlated EXISTS finds other foods sharing any of them, without duplicate outer rows.','Other foods sharing Milk or Gluten with f2 appear; pizza itself is excluded.')],
 deletes:[stmt('Delete the link before its parent',`DELETE FROM has_allergen
WHERE food_id = 'f9' AND allergen_id = 'ASMI_A';
DELETE FROM allergen WHERE allergen_id = 'ASMI_A'`,'The child relationship must be removed before the referenced master row.','Two separate 1 row deleted messages.'),stmt('Commit cleanup','COMMIT','Persist removal of both demonstration records.','Commit complete.'),stmt('Verify cleanup',`SELECT COUNT(*) AS remaining FROM allergen
WHERE allergen_id = 'ASMI_A'`,'The restrictive FK ensures no links can survive after successful parent deletion.','REMAINING = 0.')],
 viva:[['Why a composite primary key?','The food–allergen pair must be unique, while either ID alone may repeat.'],['Why delete the link first?','It references the allergen parent; Oracle prevents an orphaned relationship.'],['Why LISTAGG rather than another table?','LISTAGG changes the query output format, not the normalized storage.'],['Is no Milk link a verified allergy guarantee?','No. The project uses sample labels; real ingredients and cross-contact must be confirmed.']],
 reportExplanation:'The relationship-specific PUT is in app/api/manage/route.ts. The application stores and updates both key columns using an original-key WHERE clause. Demonstration SQL is sql/members/asmi.sql.'},
 {name:'Soha',slug:'soha',module:'Menu prices and transactions',tables:['CONTAINS'],entityLines:[4],schemaLines:'21 to 27',catalogLines:'6 and 11',reportLines:[3,4,6,8],ids:['SOHA_R'],
 introduction:'I manage Contains, the many-to-many restaurant–food relationship. A price belongs to one restaurant and food pair. I also demonstrate transaction control and the isolated DDL example.',
 columns:'Contains has composite primary key (RESTAURANT_ID, FOOD_ID), two parent FKs and a required positive price no greater than 100000. PRICE_NOTE records provenance. The same food can have different prices at different restaurants.',
 prerequisites:'Seed dish f7 must exist. A private SOHA_R restaurant fixture is created below only to isolate your menu demonstration; it does not depend on Shriya.',
 writes:[stmt('Create your independent parent fixture',`INSERT INTO restaurant
 (restaurant_id, restaurant_name, block, landmark, must_have)
VALUES ('SOHA_R', 'Soha Demo Counter', 'TT', 'Demo counter', '[]')`,'This fixture supplies your restaurant FK; its temporary identity prevents modifying seed offers.','1 row created.'),stmt('Insert your menu price',`INSERT INTO contains(restaurant_id, food_id, price, price_note)
VALUES ('SOHA_R', 'f7', 90, 'Soha demonstration only')`,'Both parent IDs exist. The pair is unique.','1 row created.'),stmt('Commit the inserts','COMMIT','Persist parent and menu so a separate session can read them.','Commit complete.'),stmt('Update your pair only',`UPDATE contains SET price = 95
WHERE restaurant_id = 'SOHA_R' AND food_id = 'f7'`,'Both PK columns constrain the update to one restaurant–food offer.','1 row updated.'),stmt('Commit the price change','COMMIT','Persist 95 as the current demonstration price.','Commit complete.')],
 selects:[
 stmt('S1 Verify the new price through joins',`SELECT r.restaurant_name, f.food_name, m.price
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.restaurant_id='SOHA_R' AND m.food_id='f7'`,'The join displays readable names while filtering by the composite identifier.','Soha Demo Counter, Masala Dosa, price 95.'),
 stmt('S2 Find cheapest offers using analytic ranking',`WITH ranked AS (
 SELECT m.*, DENSE_RANK() OVER
  (PARTITION BY food_id ORDER BY price) AS pos
 FROM menu_catalog m
)
SELECT food_name, restaurant_name, price
FROM ranked WHERE pos=1
ORDER BY food_name`,'PARTITION BY starts ranking again for each dish. DENSE_RANK preserves ties, so several outlets can share first place.','Each dish appears at its cheapest listed outlet; tied cheapest offers all remain.'),
 stmt('S3 Compare prices to each outlet average',`SELECT r.restaurant_name, f.food_name, m.price
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.price < (
 SELECT AVG(m2.price) FROM contains m2
 WHERE m2.restaurant_id=m.restaurant_id
)
ORDER BY r.restaurant_name, m.price`,'The correlated average is recalculated for the outer row\'s restaurant. An outlet with only one offer cannot be strictly below its own average.','Below-average offers appear; your single-menu fixture is absent.'),
 stmt('S4 Compare highest and lowest prices',`SELECT f.food_name, COUNT(DISTINCT m.restaurant_id) AS outlets,
 MIN(m.price) AS lowest, MAX(m.price) AS highest,
 MAX(m.price)-MIN(m.price) AS saving
FROM food_item f JOIN contains m ON m.food_id=f.food_id
GROUP BY f.food_id, f.food_name
HAVING COUNT(DISTINCT m.restaurant_id)>1
ORDER BY saving DESC, f.food_name`,'Aggregates compare offers for the same dish; HAVING removes dishes offered at only one outlet.','Masala Dosa includes your 95 offer, affecting its highest price during this demo.'),
 stmt('S5 Format prices with Oracle functions',`SELECT r.restaurant_name, f.food_name,
 TO_CHAR(m.price, 'FM999990.00') AS formatted_price,
 ROUND(m.price * 0.90, 2) AS hypothetical_discount
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.restaurant_id='SOHA_R'`,'TO_CHAR formats display text; ROUND computes a hypothetical 10 percent discount. It does not update stored prices or claim a real promotion.','Formatted price 95.00 and hypothetical discount price 85.5.')],
 transactions:[stmt('Set a savepoint','SAVEPOINT before_price_change','Mark the current transaction position after the committed 95 price.','Savepoint created.'),stmt('Make an uncommitted change',`UPDATE contains SET price=999
WHERE restaurant_id='SOHA_R' AND food_id='f7'`,'Do not COMMIT between this update and ROLLBACK TO.','1 row updated.'),stmt('Show the temporary value',`SELECT price FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7'`,'Your own session sees its uncommitted change.','PRICE = 999.'),stmt('Undo only the later change','ROLLBACK TO before_price_change','Return to the savepoint; keep the row that was committed earlier.','Rollback complete.'),stmt('Verify the restored value',`SELECT price FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7'`,'The original committed value is restored.','PRICE = 95.')],
 deletes:[stmt('Delete the menu before its parent',`DELETE FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7';
DELETE FROM restaurant WHERE restaurant_id='SOHA_R'`,'Remove the relationship first to respect the FK, then the isolated fixture.','Two separate 1 row deleted messages.'),stmt('Commit cleanup','COMMIT','Persist both deletions.','Commit complete.'),stmt('Verify cleanup',`SELECT COUNT(*) AS remaining FROM restaurant
WHERE restaurant_id='SOHA_R'`,'Your private parent fixture should be gone.','REMAINING = 0.')],
 viva:[['Why is price on Contains?','Different restaurants can charge different prices for the same dish.'],['Why filter UPDATE by both IDs?','Both columns form the identity of one menu offer.'],['COMMIT versus ROLLBACK TO?','COMMIT makes changes durable and erases savepoints; ROLLBACK TO undoes later uncommitted work.'],['Does DDL roll back like DML?','Oracle DDL implicitly commits; use only the dedicated scratch table for the DDL demonstration.']],
 reportExplanation:'Ranking and price comparison queries already exist in lib/reports.ts. Your private fixture and five SELECTs are in sql/members/soha.sql.'}
];
