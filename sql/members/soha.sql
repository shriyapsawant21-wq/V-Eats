-- Soha: Menu prices and transactions. Run only against your VEATS_APP demonstration schema.
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


-- WRITE: Create your independent parent fixture
PROMPT Create your independent parent fixture
INSERT INTO restaurant
 (restaurant_id, restaurant_name, block, landmark, must_have)
VALUES ('SOHA_R', 'Soha Demo Counter', 'TT', 'Demo counter', '[]');
PAUSE Explain this result then press Enter to continue

-- WRITE: Insert your menu price
PROMPT Insert your menu price
INSERT INTO contains(restaurant_id, food_id, price, price_note)
VALUES ('SOHA_R', 'f7', 90, 'Soha demonstration only');
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the inserts
PROMPT Commit the inserts
COMMIT;
PAUSE Explain this result then press Enter to continue

-- WRITE: Update your pair only
PROMPT Update your pair only
UPDATE contains SET price = 95
WHERE restaurant_id = 'SOHA_R' AND food_id = 'f7';
PAUSE Explain this result then press Enter to continue

-- WRITE: Commit the price change
PROMPT Commit the price change
COMMIT;
PAUSE Explain this result then press Enter to continue

-- SELECT: S1 Verify the new price through joins
PROMPT S1 Verify the new price through joins
SELECT r.restaurant_name, f.food_name, m.price
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.restaurant_id='SOHA_R' AND m.food_id='f7';
PAUSE Explain this result then press Enter to continue

-- SELECT: S2 Find cheapest offers using analytic ranking
PROMPT S2 Find cheapest offers using analytic ranking
WITH ranked AS (
 SELECT m.*, DENSE_RANK() OVER
  (PARTITION BY food_id ORDER BY price) AS pos
 FROM menu_catalog m
)
SELECT food_name, restaurant_name, price
FROM ranked WHERE pos=1
ORDER BY food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S3 Compare prices to each outlet average
PROMPT S3 Compare prices to each outlet average
SELECT r.restaurant_name, f.food_name, m.price
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.price < (
 SELECT AVG(m2.price) FROM contains m2
 WHERE m2.restaurant_id=m.restaurant_id
)
ORDER BY r.restaurant_name, m.price;
PAUSE Explain this result then press Enter to continue

-- SELECT: S4 Compare highest and lowest prices
PROMPT S4 Compare highest and lowest prices
SELECT f.food_name, COUNT(DISTINCT m.restaurant_id) AS outlets,
 MIN(m.price) AS lowest, MAX(m.price) AS highest,
 MAX(m.price)-MIN(m.price) AS saving
FROM food_item f JOIN contains m ON m.food_id=f.food_id
GROUP BY f.food_id, f.food_name
HAVING COUNT(DISTINCT m.restaurant_id)>1
ORDER BY saving DESC, f.food_name;
PAUSE Explain this result then press Enter to continue

-- SELECT: S5 Format prices with Oracle functions
PROMPT S5 Format prices with Oracle functions
SELECT r.restaurant_name, f.food_name,
 TO_CHAR(m.price, 'FM999990.00') AS formatted_price,
 ROUND(m.price * 0.90, 2) AS hypothetical_discount
FROM contains m
JOIN restaurant r ON r.restaurant_id=m.restaurant_id
JOIN food_item f ON f.food_id=m.food_id
WHERE m.restaurant_id='SOHA_R';
PAUSE Explain this result then press Enter to continue

-- TRANSACTION: Set a savepoint
PROMPT Set a savepoint
SAVEPOINT before_price_change;
PAUSE Explain this result then press Enter to continue

-- TRANSACTION: Make an uncommitted change
PROMPT Make an uncommitted change
UPDATE contains SET price=999
WHERE restaurant_id='SOHA_R' AND food_id='f7';
PAUSE Explain this result then press Enter to continue

-- TRANSACTION: Show the temporary value
PROMPT Show the temporary value
SELECT price FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7';
PAUSE Explain this result then press Enter to continue

-- TRANSACTION: Undo only the later change
PROMPT Undo only the later change
ROLLBACK TO before_price_change;
PAUSE Explain this result then press Enter to continue

-- TRANSACTION: Verify the restored value
PROMPT Verify the restored value
SELECT price FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Delete the menu before its parent
PROMPT Delete the menu before its parent
DELETE FROM contains
WHERE restaurant_id='SOHA_R' AND food_id='f7';
DELETE FROM restaurant WHERE restaurant_id='SOHA_R';
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Commit cleanup
PROMPT Commit cleanup
COMMIT;
PAUSE Explain this result then press Enter to continue

-- CLEANUP: Verify cleanup
PROMPT Verify cleanup
SELECT COUNT(*) AS remaining FROM restaurant
WHERE restaurant_id='SOHA_R';
PAUSE Explain this result then press Enter to continue

-- DDL: Create a scratch table
PROMPT Create a scratch table
CREATE TABLE soha_ddl_demo (demo_id NUMBER PRIMARY KEY);
PAUSE Explain this result then press Enter to continue

-- DDL: Alter the scratch table
PROMPT Alter the scratch table
ALTER TABLE soha_ddl_demo ADD note VARCHAR2(40);
PAUSE Explain this result then press Enter to continue

-- DDL: Verify the added column
PROMPT Verify the added column
SELECT column_name, data_type FROM user_tab_columns
WHERE table_name='SOHA_DDL_DEMO' ORDER BY column_id;
PAUSE Explain this result then press Enter to continue

-- DDL: Drop only the scratch table
PROMPT Drop only the scratch table
DROP TABLE soha_ddl_demo PURGE;
PAUSE Explain this result then press Enter to continue

PROMPT Module finished. Your temporary records have been removed.
