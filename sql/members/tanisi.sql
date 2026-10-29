-- Tanisi: Categories cuisines and dietary types. Run only against your VEATS_APP demonstration schema.
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


-- WRITE: Insert one record into each owned table
PROMPT Insert one record into each owned table
INSERT INTO category VALUES ('TANISI_C', 'Tanisi Demo Category');
INSERT INTO cuisine VALUES ('TANISI_U', 'Tanisi Demo Cuisine');
INSERT INTO dietary_type VALUES ('TANISI_D', 'Tanisi Demo Diet');
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the inserts
PROMPT Commit the inserts
COMMIT;
PAUSE Explain this result then press Enter to continue

-- WRITE: Update all three lookup names
PROMPT Update all three lookup names
UPDATE category SET category_name = 'Tanisi Category Updated'
WHERE category_id = 'TANISI_C';
UPDATE cuisine SET cuisine_name = 'Tanisi Cuisine Updated'
WHERE cuisine_id = 'TANISI_U';
UPDATE dietary_type SET type_name = 'Tanisi Diet Updated'
WHERE dietary_type_id = 'TANISI_D';
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the updates
PROMPT Commit the updates
COMMIT;
PAUSE Explain this result then press Enter to continue

-- SELECT: S1 Verify all three updates using UNION ALL
PROMPT S1 Verify all three updates using UNION ALL
SELECT 'Category' AS kind, category_id AS id,
       category_name AS name FROM category
WHERE category_id = 'TANISI_C'
UNION ALL
SELECT 'Cuisine', cuisine_id, cuisine_name FROM cuisine
WHERE cuisine_id = 'TANISI_U'
UNION ALL
SELECT 'Diet', dietary_type_id, type_name FROM dietary_type
WHERE dietary_type_id = 'TANISI_D';
PAUSE Explain this result then press Enter to continue

-- SELECT: S2 Count food in every category
PROMPT S2 Count food in every category
SELECT c.category_name, COUNT(f.food_id) AS dishes
FROM category c LEFT JOIN food_item f
 ON f.category_id = c.category_id
GROUP BY c.category_id, c.category_name
ORDER BY dishes DESC, c.category_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S3 Find cuisines with more than one dish
PROMPT S3 Find cuisines with more than one dish
SELECT c.cuisine_name, COUNT(f.food_id) AS dishes
FROM cuisine c JOIN food_item f
 ON f.cuisine_id = c.cuisine_id
GROUP BY c.cuisine_id, c.cuisine_name
HAVING COUNT(f.food_id) > 1
ORDER BY dishes DESC;
PAUSE Explain this result then press Enter to continue

-- SELECT: S4 Find unused dietary types
PROMPT S4 Find unused dietary types
SELECT d.type_name
FROM dietary_type d
WHERE NOT EXISTS (
 SELECT 1 FROM food_item f
 WHERE f.dietary_type_id = d.dietary_type_id
)
ORDER BY d.type_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S5 Find Indian meals with INTERSECT
PROMPT S5 Find Indian meals with INTERSECT
SELECT food_name FROM food_item WHERE cuisine_id = 'Indian'
INTERSECT
SELECT food_name FROM food_item WHERE category_id = 'Meals'
ORDER BY food_name;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Delete only your three unused lookups
PROMPT Delete only your three unused lookups
DELETE FROM category WHERE category_id = 'TANISI_C';
DELETE FROM cuisine WHERE cuisine_id = 'TANISI_U';
DELETE FROM dietary_type WHERE dietary_type_id = 'TANISI_D';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Commit cleanup
PROMPT Commit cleanup
COMMIT;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Verify cleanup
PROMPT Verify cleanup
SELECT
 (SELECT COUNT(*) FROM category WHERE category_id='TANISI_C')
 + (SELECT COUNT(*) FROM cuisine WHERE cuisine_id='TANISI_U')
 + (SELECT COUNT(*) FROM dietary_type
    WHERE dietary_type_id='TANISI_D') AS remaining
FROM dual;
PAUSE Explain this result then press Enter to continue

PROMPT Module finished. Your temporary records have been removed.
