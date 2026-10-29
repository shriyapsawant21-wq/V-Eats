-- Trisha: Food items. Run only against your VEATS_APP demonstration schema.
-- Interactive worksheet: copy each SQL statement to SQL>, or execute this script with pauses.
SET ECHO ON
SET FEEDBACK ON
SET PAGESIZE 100
SET LINESIZE 180
SET TRIMSPOOL ON
COLUMN restaurant_name FORMAT A28
COLUMN food_name FORMAT A25
COLUMN landmark FORMAT A26
COLUMN description FORMAT A43
COLUMN category_name FORMAT A26
COLUMN cuisine_name FORMAT A26
COLUMN type_name FORMAT A24
COLUMN allergen_name FORMAT A26
COLUMN listed_allergens FORMAT A40
COLUMN name FORMAT A27
COLUMN id FORMAT A15
COLUMN kind FORMAT A10
COLUMN outlet FORMAT A28
COLUMN location FORMAT A28
COLUMN formatted_price FORMAT A16


-- WRITE: Insert your dish
PROMPT Insert your dish
INSERT INTO food_item
 (food_id, food_name, category_id, cuisine_id,
  dietary_type_id, description)
VALUES ('TRISHA_F', 'Trisha Demo Rice', 'Meals', 'Indian',
 'Vegetarian', 'Dish for the database demonstration');
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the insert
PROMPT Commit the insert
COMMIT;
PAUSE Explain this result then press Enter to continue

-- WRITE: Update its description
PROMPT Update its description
UPDATE food_item
SET description = 'Updated vegetarian rice description'
WHERE food_id = 'TRISHA_F';
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the update
PROMPT Commit the update
COMMIT;
PAUSE Explain this result then press Enter to continue

-- SELECT: S1 Search your dish and verify the update
PROMPT S1 Search your dish and verify the update
SELECT food_id, food_name, description
FROM food_item
WHERE food_id = 'TRISHA_F';
PAUSE Explain this result then press Enter to continue

-- SELECT: S2 Display classification names with four tables
PROMPT S2 Display classification names with four tables
SELECT f.food_name, c.category_name, u.cuisine_name,
       d.type_name
FROM food_item f
JOIN category c ON c.category_id = f.category_id
JOIN cuisine u ON u.cuisine_id = f.cuisine_id
JOIN dietary_type d ON d.dietary_type_id = f.dietary_type_id
ORDER BY f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S3 Find dishes with an affordable offer
PROMPT S3 Find dishes with an affordable offer
SELECT f.food_name
FROM food_item f
WHERE EXISTS (
 SELECT 1 FROM contains m
 WHERE m.food_id = f.food_id AND m.price < 100
)
ORDER BY f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S4 Count dishes by category and diet
PROMPT S4 Count dishes by category and diet
SELECT category_id, dietary_type_id, COUNT(*) AS dishes
FROM food_item
GROUP BY category_id, dietary_type_id
HAVING COUNT(*) >= 2
ORDER BY category_id, dietary_type_id;
PAUSE Explain this result then press Enter to continue

-- SELECT: S5 Find food without a menu using MINUS
PROMPT S5 Find food without a menu using MINUS
SELECT food_id, food_name FROM food_item
MINUS
SELECT f.food_id, f.food_name
FROM food_item f JOIN contains m ON m.food_id = f.food_id
ORDER BY food_name;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Delete only your unlisted dish
PROMPT Delete only your unlisted dish
DELETE FROM food_item WHERE food_id = 'TRISHA_F';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Commit the deletion
PROMPT Commit the deletion
COMMIT;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Verify cleanup
PROMPT Verify cleanup
SELECT COUNT(*) AS remaining FROM food_item
WHERE food_id = 'TRISHA_F';
PAUSE Explain this result then press Enter to continue

PROMPT Module finished. Your temporary records have been removed.
