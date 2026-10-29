-- Run with SQL*Plus as VEATS_APP. Reserved demo ID only; no seed data changed.
SET ECHO ON
SET FEEDBACK ON
SET PAGESIZE 100
SET LINESIZE 180
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK
SPOOL dml-tcl-output.txt
INSERT INTO category(category_id,category_name) VALUES ('DEMO_TCL','Transaction demonstration');
COMMIT;
SELECT * FROM category WHERE category_id='DEMO_TCL';
SAVEPOINT before_change;
UPDATE category SET category_name='Temporary update' WHERE category_id='DEMO_TCL';
SELECT * FROM category WHERE category_id='DEMO_TCL';
ROLLBACK TO before_change;
SELECT * FROM category WHERE category_id='DEMO_TCL';
DELETE FROM category WHERE category_id='DEMO_TCL';
SELECT COUNT(*) AS after_delete FROM category WHERE category_id='DEMO_TCL';
ROLLBACK;
SELECT COUNT(*) AS after_rollback FROM category WHERE category_id='DEMO_TCL';
DELETE FROM category WHERE category_id='DEMO_TCL';
COMMIT;
SELECT COUNT(*) AS after_committed_delete FROM category WHERE category_id='DEMO_TCL';
SPOOL OFF
