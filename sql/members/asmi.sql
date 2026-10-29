-- Asmi: Allergens and food allergen links. Run only against your VEATS_APP demonstration schema.
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


-- WRITE: Insert a parent allergen and its link
PROMPT Insert a parent allergen and its link
INSERT INTO allergen VALUES ('ASMI_A', 'Asmi Demo Allergen');
INSERT INTO has_allergen(food_id, allergen_id)
VALUES ('f7', 'ASMI_A');
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the inserts
PROMPT Commit the inserts
COMMIT;
PAUSE Explain this result then press Enter to continue

-- WRITE: Update the name and relationship
PROMPT Update the name and relationship
UPDATE allergen SET allergen_name = 'Asmi Allergen Updated'
WHERE allergen_id = 'ASMI_A';
UPDATE has_allergen SET food_id = 'f9'
WHERE food_id = 'f7' AND allergen_id = 'ASMI_A';
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the updates
PROMPT Commit the updates
COMMIT;
PAUSE Explain this result then press Enter to continue

-- SELECT: S1 Display the updated relationship
PROMPT S1 Display the updated relationship
SELECT f.food_name, a.allergen_name
FROM has_allergen h
JOIN food_item f ON f.food_id = h.food_id
JOIN allergen a ON a.allergen_id = h.allergen_id
WHERE h.allergen_id = 'ASMI_A';
PAUSE Explain this result then press Enter to continue

-- SELECT: S2 List allergen names for every food
PROMPT S2 List allergen names for every food
SELECT f.food_name,
 NVL(LISTAGG(a.allergen_name, ', ')
 WITHIN GROUP (ORDER BY a.allergen_name), 'None listed')
 AS listed_allergens
FROM food_item f
LEFT JOIN has_allergen h ON h.food_id = f.food_id
LEFT JOIN allergen a ON a.allergen_id = h.allergen_id
GROUP BY f.food_id, f.food_name
ORDER BY f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S3 Find vegetarian food without listed milk
PROMPT S3 Find vegetarian food without listed milk
SELECT f.food_name
FROM food_item f
WHERE f.dietary_type_id IN ('Vegetarian', 'Vegan')
AND NOT EXISTS (
 SELECT 1 FROM has_allergen h
 WHERE h.food_id = f.food_id AND h.allergen_id = 'Milk'
)
ORDER BY f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S4 Find foods with several listed allergens
PROMPT S4 Find foods with several listed allergens
SELECT f.food_name, COUNT(*) AS allergen_count
FROM food_item f JOIN has_allergen h ON h.food_id=f.food_id
GROUP BY f.food_id, f.food_name
HAVING COUNT(*) >= 2
ORDER BY allergen_count DESC, f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S5 Find foods sharing allergens with pizza
PROMPT S5 Find foods sharing allergens with pizza
SELECT f.food_name
FROM food_item f
WHERE f.food_id <> 'f2'
AND EXISTS (
 SELECT 1 FROM has_allergen h
 WHERE h.food_id = f.food_id
 AND h.allergen_id IN (
  SELECT allergen_id FROM has_allergen WHERE food_id='f2'
 )
)
ORDER BY f.food_name;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Delete the link before its parent
PROMPT Delete the link before its parent
DELETE FROM has_allergen
WHERE food_id = 'f9' AND allergen_id = 'ASMI_A';
DELETE FROM allergen WHERE allergen_id = 'ASMI_A';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Commit cleanup
PROMPT Commit cleanup
COMMIT;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Verify cleanup
PROMPT Verify cleanup
SELECT COUNT(*) AS remaining FROM allergen
WHERE allergen_id = 'ASMI_A';
PAUSE Explain this result then press Enter to continue

PROMPT Module finished. Your temporary records have been removed.
