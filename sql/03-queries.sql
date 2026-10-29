SET ECHO ON
SET PAGESIZE 1000
SET LINESIZE 220
SET TRIMSPOOL ON
COLUMN restaurant_name FORMAT A30
COLUMN food_name FORMAT A25
COLUMN cuisine_name FORMAT A15
COLUMN type_name FORMAT A16
COLUMN listed_allergens FORMAT A28
COLUMN restaurant FORMAT A30
COLUMN location FORMAT A35
COLUMN table_name FORMAT A18
COLUMN column_name FORMAT A22
COLUMN constraint_name FORMAT A28
COLUMN constraint_type FORMAT A5
COLUMN status FORMAT A10
COLUMN data_type FORMAT A12
COLUMN nullable FORMAT A8
SPOOL query-output.txt
VARIABLE term VARCHAR2(100)
EXEC :term := '%dosa%';

PROMPT === Menu search ===
PROMPT Multi-table JOIN, LIKE, ORDER BY
PROMPT SELECT restaurant_name, food_name, cuisine_name, type_name, price FROM menu_catalog WHERE LOWER(food_name) LIKE :term ORDER BY price, restaurant_name;
SELECT restaurant_name, food_name, cuisine_name, type_name, price FROM menu_catalog WHERE LOWER(food_name) LIKE :term ORDER BY price, restaurant_name;

PROMPT === Best price for every dish ===
PROMPT CTE, DENSE_RANK analytic function, joins
PROMPT WITH ranked AS (SELECT m.*, DENSE_RANK() OVER (PARTITION BY food_id ORDER BY price) AS price_rank FROM menu_catalog m) SELECT food_name, restaurant_name, price, price_rank FROM ranked WHERE price_rank=1 ORDER BY food_name;
WITH ranked AS (SELECT m.*, DENSE_RANK() OVER (PARTITION BY food_id ORDER BY price) AS price_rank FROM menu_catalog m) SELECT food_name, restaurant_name, price, price_rank FROM ranked WHERE price_rank=1 ORDER BY food_name;

PROMPT === Below the restaurant average ===
PROMPT Correlated subquery, AVG, multi-table joins
PROMPT SELECT r.restaurant_name, f.food_name, m.price FROM contains m JOIN restaurant r ON r.restaurant_id=m.restaurant_id JOIN food_item f ON f.food_id=m.food_id WHERE m.price < (SELECT AVG(m2.price) FROM contains m2 WHERE m2.restaurant_id=m.restaurant_id) ORDER BY r.restaurant_name, m.price;
SELECT r.restaurant_name, f.food_name, m.price FROM contains m JOIN restaurant r ON r.restaurant_id=m.restaurant_id JOIN food_item f ON f.food_id=m.food_id WHERE m.price < (SELECT AVG(m2.price) FROM contains m2 WHERE m2.restaurant_id=m.restaurant_id) ORDER BY r.restaurant_name, m.price;

PROMPT === Vegetarian dishes without listed milk ===
PROMPT NOT EXISTS anti-join, correlated subquery
PROMPT SELECT f.food_name, MIN(m.price) AS minimum_price FROM food_item f JOIN contains m ON m.food_id=f.food_id WHERE f.dietary_type_id IN ('Vegetarian','Vegan') AND NOT EXISTS (SELECT 1 FROM has_allergen a WHERE a.food_id=f.food_id AND a.allergen_id='Milk') GROUP BY f.food_id,f.food_name ORDER BY minimum_price;
SELECT f.food_name, MIN(m.price) AS minimum_price FROM food_item f JOIN contains m ON m.food_id=f.food_id WHERE f.dietary_type_id IN ('Vegetarian','Vegan') AND NOT EXISTS (SELECT 1 FROM has_allergen a WHERE a.food_id=f.food_id AND a.allergen_id='Milk') GROUP BY f.food_id,f.food_name ORDER BY minimum_price;

PROMPT === Restaurant menu statistics ===
PROMPT LEFT JOIN, GROUP BY, HAVING, ROUND, aggregate functions
PROMPT SELECT r.restaurant_name, COUNT(m.food_id) AS dish_count, MIN(m.price) AS minimum_price, MAX(m.price) AS maximum_price, ROUND(AVG(m.price),2) AS average_price FROM restaurant r LEFT JOIN contains m ON m.restaurant_id=r.restaurant_id GROUP BY r.restaurant_id,r.restaurant_name HAVING COUNT(m.food_id)>=2 ORDER BY average_price;
SELECT r.restaurant_name, COUNT(m.food_id) AS dish_count, MIN(m.price) AS minimum_price, MAX(m.price) AS maximum_price, ROUND(AVG(m.price),2) AS average_price FROM restaurant r LEFT JOIN contains m ON m.restaurant_id=r.restaurant_id GROUP BY r.restaurant_id,r.restaurant_name HAVING COUNT(m.food_id)>=2 ORDER BY average_price;

PROMPT === Allergen profile by dish ===
PROMPT LISTAGG, outer joins, NVL
PROMPT SELECT f.food_name, NVL(LISTAGG(a.allergen_name, ', ') WITHIN GROUP (ORDER BY a.allergen_name),'None listed') AS listed_allergens FROM food_item f LEFT JOIN has_allergen h ON h.food_id=f.food_id LEFT JOIN allergen a ON a.allergen_id=h.allergen_id GROUP BY f.food_id,f.food_name ORDER BY f.food_name;
SELECT f.food_name, NVL(LISTAGG(a.allergen_name, ', ') WITHIN GROUP (ORDER BY a.allergen_name),'None listed') AS listed_allergens FROM food_item f LEFT JOIN has_allergen h ON h.food_id=f.food_id LEFT JOIN allergen a ON a.allergen_id=h.allergen_id GROUP BY f.food_id,f.food_name ORDER BY f.food_name;

PROMPT === Outlets serving every vegan dish ===
PROMPT Relational division using double NOT EXISTS
PROMPT SELECT r.restaurant_name FROM restaurant r WHERE NOT EXISTS (SELECT 1 FROM food_item f WHERE f.dietary_type_id='Vegan' AND NOT EXISTS (SELECT 1 FROM contains m WHERE m.restaurant_id=r.restaurant_id AND m.food_id=f.food_id)) ORDER BY r.restaurant_name;
SELECT r.restaurant_name FROM restaurant r WHERE NOT EXISTS (SELECT 1 FROM food_item f WHERE f.dietary_type_id='Vegan' AND NOT EXISTS (SELECT 1 FROM contains m WHERE m.restaurant_id=r.restaurant_id AND m.food_id=f.food_id)) ORDER BY r.restaurant_name;

PROMPT === Dishes with multiple prices ===
PROMPT GROUP BY, HAVING, MAX-MIN, COUNT DISTINCT
PROMPT SELECT f.food_name,COUNT(DISTINCT m.restaurant_id) AS outlets,MIN(m.price) AS lowest,MAX(m.price) AS highest,MAX(m.price)-MIN(m.price) AS saving FROM food_item f JOIN contains m ON m.food_id=f.food_id GROUP BY f.food_id,f.food_name HAVING COUNT(DISTINCT m.restaurant_id)>1 ORDER BY saving DESC;
SELECT f.food_name,COUNT(DISTINCT m.restaurant_id) AS outlets,MIN(m.price) AS lowest,MAX(m.price) AS highest,MAX(m.price)-MIN(m.price) AS saving FROM food_item f JOIN contains m ON m.food_id=f.food_id GROUP BY f.food_id,f.food_name HAVING COUNT(DISTINCT m.restaurant_id)>1 ORDER BY saving DESC;

PROMPT === Indian dishes also listed under meals ===
PROMPT INTERSECT set operator, subqueries
PROMPT SELECT food_name FROM food_item WHERE cuisine_id='Indian' INTERSECT SELECT food_name FROM food_item WHERE category_id='Meals' ORDER BY food_name;
SELECT food_name FROM food_item WHERE cuisine_id='Indian' INTERSECT SELECT food_name FROM food_item WHERE category_id='Meals' ORDER BY food_name;

PROMPT === Formatted restaurant directory ===
PROMPT UPPER, SUBSTR, LENGTH, TO_CHAR date functions
PROMPT SELECT UPPER(restaurant_name) AS restaurant, SUBSTR(landmark,1,35) AS location, LENGTH(restaurant_name) AS name_length, TO_CHAR(created_at,'DD-MON-YYYY') AS added_on FROM restaurant ORDER BY restaurant_name;
SELECT UPPER(restaurant_name) AS restaurant, SUBSTR(landmark,1,35) AS location, LENGTH(restaurant_name) AS name_length, TO_CHAR(created_at,'DD-MON-YYYY') AS added_on FROM restaurant ORDER BY restaurant_name;

PROMPT === Live integrity constraints ===
PROMPT Oracle data dictionary
PROMPT SELECT table_name,constraint_name,constraint_type,status FROM user_constraints WHERE table_name IN ('RESTAURANT','FOOD_ITEM','CATEGORY','CUISINE','DIETARY_TYPE','ALLERGEN','CONTAINS','HAS_ALLERGEN') ORDER BY table_name,constraint_type;
SELECT table_name,constraint_name,constraint_type,status FROM user_constraints WHERE table_name IN ('RESTAURANT','FOOD_ITEM','CATEGORY','CUISINE','DIETARY_TYPE','ALLERGEN','CONTAINS','HAS_ALLERGEN') ORDER BY table_name,constraint_type;

PROMPT === Live table definitions ===
PROMPT Oracle data dictionary, DDL verification
PROMPT SELECT table_name,column_name,data_type,data_length,nullable FROM user_tab_columns WHERE table_name IN ('RESTAURANT','FOOD_ITEM','CATEGORY','CUISINE','DIETARY_TYPE','ALLERGEN','CONTAINS','HAS_ALLERGEN') ORDER BY table_name,column_id;
SELECT table_name,column_name,data_type,data_length,nullable FROM user_tab_columns WHERE table_name IN ('RESTAURANT','FOOD_ITEM','CATEGORY','CUISINE','DIETARY_TYPE','ALLERGEN','CONTAINS','HAS_ALLERGEN') ORDER BY table_name,column_id;

SPOOL OFF
