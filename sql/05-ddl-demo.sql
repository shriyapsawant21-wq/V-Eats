-- Scratch table only. Oracle DDL commits implicitly.
SET ECHO ON
WHENEVER SQLERROR EXIT SQL.SQLCODE
SPOOL ddl-output.txt
CREATE TABLE veats_ddl_demo (demo_id NUMBER PRIMARY KEY, note VARCHAR2(40));
ALTER TABLE veats_ddl_demo ADD created_on DATE DEFAULT SYSDATE;
INSERT INTO veats_ddl_demo(demo_id,note) VALUES (1,'DDL demonstration');
COMMIT;
SELECT * FROM veats_ddl_demo;
TRUNCATE TABLE veats_ddl_demo;
SELECT COUNT(*) AS after_truncate FROM veats_ddl_demo;
DROP TABLE veats_ddl_demo PURGE;
SPOOL OFF
