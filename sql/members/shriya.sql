-- Shriya: Restaurants. Run only against your VEATS_APP demonstration schema.
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


-- WRITE: Insert your demonstration restaurant
PROMPT Insert your demonstration restaurant
INSERT INTO restaurant
 (restaurant_id, restaurant_name, block, landmark, must_have)
VALUES ('SHRIYA_R', 'Shriya Demo Canteen', 'GDN',
 'Demo counter', '["Dosa", "Coffee"]');
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the insert
PROMPT Commit the insert
COMMIT;
PAUSE Explain this result then press Enter to continue

-- WRITE: Update its location
PROMPT Update its location
UPDATE restaurant
SET landmark = 'Updated demo counter'
WHERE restaurant_id = 'SHRIYA_R';
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the update
PROMPT Commit the update
COMMIT;
PAUSE Explain this result then press Enter to continue

-- SELECT: S1 Display and search your record
PROMPT S1 Display and search your record
SELECT restaurant_id, restaurant_name, block, landmark
FROM restaurant
WHERE restaurant_id = 'SHRIYA_R';
PAUSE Explain this result then press Enter to continue

-- SELECT: S2 Summarize menus including empty restaurants
PROMPT S2 Summarize menus including empty restaurants
SELECT r.restaurant_name, COUNT(m.food_id) AS dishes,
       ROUND(AVG(m.price), 2) AS avg_price
FROM restaurant r
LEFT JOIN contains m ON m.restaurant_id = r.restaurant_id
GROUP BY r.restaurant_id, r.restaurant_name
ORDER BY r.restaurant_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S3 Find outlets below the overall menu average
PROMPT S3 Find outlets below the overall menu average
SELECT r.restaurant_name
FROM restaurant r
WHERE EXISTS (
 SELECT 1 FROM contains m
 WHERE m.restaurant_id = r.restaurant_id
 AND m.price < (SELECT AVG(price) FROM contains)
)
ORDER BY r.restaurant_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S4 Format the directory using SQL functions
PROMPT S4 Format the directory using SQL functions
SELECT UPPER(restaurant_name) AS outlet,
       SUBSTR(landmark, 1, 28) AS location,
       LENGTH(restaurant_name) AS name_length
FROM restaurant
ORDER BY restaurant_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S5 Find restaurants serving both Indian and vegetarian food
PROMPT S5 Find restaurants serving both Indian and vegetarian food
SELECT r.restaurant_name
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
ORDER BY r.restaurant_name;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Delete only your restaurant
PROMPT Delete only your restaurant
DELETE FROM restaurant WHERE restaurant_id = 'SHRIYA_R';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Commit the deletion
PROMPT Commit the deletion
COMMIT;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Verify cleanup
PROMPT Verify cleanup
SELECT COUNT(*) AS remaining FROM restaurant
WHERE restaurant_id = 'SHRIYA_R';
PAUSE Explain this result then press Enter to continue

PROMPT Module finished. Your temporary records have been removed.
