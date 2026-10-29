-- Run as SYSDBA on the Oracle Free container. Do not commit a real password.
-- Oracle Free installation creates the FREE database and FREEPDB1 pluggable database.
-- Create an application schema inside that PDB, not a second database instance.
ALTER SESSION SET CONTAINER=FREEPDB1;
ACCEPT app_password CHAR PROMPT 'Application schema password: ' HIDE
CREATE USER VEATS_APP IDENTIFIED BY "&app_password" DEFAULT TABLESPACE users QUOTA 50M ON users;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO VEATS_APP;
UNDEFINE app_password
-- Connect as VEATS_APP to localhost:1521/FREEPDB1 before running 01-schema.sql.
