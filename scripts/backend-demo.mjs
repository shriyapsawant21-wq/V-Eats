import {spawnSync} from 'node:child_process';
const {ORACLE_USER:user,ORACLE_PASSWORD:password}=process.env;
if(!user||!password||/["\r\n]/.test(password)||!/^[A-Za-z0-9_]+$/.test(user))throw Error('Configure valid Oracle credentials in .env.local first.');
for(const [source,destination] of [['sql/03-queries.sql','/tmp/veats-queries.sql'],['sql/04-dml-tcl.sql','/tmp/veats-transactions.sql'],['sql/05-ddl-demo.sql','/tmp/veats-ddl.sql']]){
 const r=spawnSync('docker',['cp',source,'oracle-free:'+destination],{encoding:'utf8'});if(r.status!==0)throw Error('Cannot copy demonstration SQL to oracle-free. Is Docker running?');
}
// Credentials are passed on stdin with echo disabled; they are never logged.
const input=`SET ECHO OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK
CONNECT ${user}/"${password}"@//127.0.0.1:1521/FREEPDB1
PROMPT === V-EATS: ORACLE SQL DEMONSTRATION ===
@/tmp/veats-queries.sql
@/tmp/veats-transactions.sql
@/tmp/veats-ddl.sql
EXIT
`;
const run=spawnSync('docker',['exec','-i','oracle-free','sqlplus','-s','/nolog'],{input,encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
if(run.stdout)process.stdout.write(run.stdout);
if(run.stderr)process.stderr.write(run.stderr);
process.exitCode=run.status||0;
