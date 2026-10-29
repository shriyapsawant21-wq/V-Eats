import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const path='.env.local';
let existing='';try{existing=readFileSync(path,'utf8')}catch{}
const read=(key)=>existing.match(new RegExp(`^${key}=(.*)$`,'m'))?.[1]?.trim();
const password=read('ORACLE_PASSWORD')||randomBytes(20).toString('hex');
const token=read('ADMIN_TOKEN')||randomBytes(24).toString('hex');
// Credentials travel over stdin, never command arguments or console output.
const sql=`WHENEVER SQLERROR EXIT SQL.SQLCODE
ALTER SESSION SET CONTAINER=FREEPDB1;
DECLARE n NUMBER; BEGIN SELECT COUNT(*) INTO n FROM dba_users WHERE username='VEATS_APP'; IF n=0 THEN EXECUTE IMMEDIATE 'CREATE USER VEATS_APP IDENTIFIED BY "${password}" DEFAULT TABLESPACE users QUOTA 50M ON users'; END IF; END;
/
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO VEATS_APP;
EXIT;
`;
const child=spawnSync('docker',['exec','-i','oracle-free','sqlplus','-s','/','as','sysdba'],{input:sql,encoding:'utf8',timeout:30000});
if(child.status!==0||/ORA-\d+/.test(child.stdout||''))throw Error('Oracle schema creation failed. Check the oracle-free container and existing VEATS_APP credentials.');
const other=existing.split(/\r?\n/).filter(l=>! /^(ORACLE_|ADMIN_TOKEN=)/.test(l)).join('\n').trim();
writeFileSync(path,`${other}\nORACLE_USER=VEATS_APP\nORACLE_PASSWORD=${password}\nORACLE_CONNECT_STRING=127.0.0.1:1521/FREEPDB1\nADMIN_TOKEN=${token}\n`);
console.log('VEATS_APP schema ready in FREEPDB1. Connection and admin key stored in ignored .env.local.');
