import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {members} from './member-demo-data.mjs';
export const ddlSteps=[
 {title:'Create a scratch table',sql:'CREATE TABLE soha_ddl_demo (demo_id NUMBER PRIMARY KEY)',why:'Use an isolated scratch table; never recreate existing project tables.',expected:'Table created.'},
 {title:'Alter the scratch table',sql:'ALTER TABLE soha_ddl_demo ADD note VARCHAR2(40)',why:'Add a column using DDL.',expected:'Table altered.'},
 {title:'Verify the added column',sql:"SELECT column_name, data_type FROM user_tab_columns\nWHERE table_name='SOHA_DDL_DEMO' ORDER BY column_id",why:'Read Oracle metadata to prove the ALTER worked.',expected:'DEMO_ID NUMBER and NOTE VARCHAR2.'},
 {title:'Drop only the scratch table',sql:'DROP TABLE soha_ddl_demo PURGE',why:'Remove the table created specifically for this demonstration. Oracle DDL commits implicitly.',expected:'Table dropped.'}
];
mkdirSync('sql/members',{recursive:true});
const format=`SET ECHO ON
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
`;
for(const m of members){
 let text=`-- ${m.name}: ${m.module}. Run only against your VEATS_APP demonstration schema.\n-- Interactive worksheet: copy each SQL statement to SQL>, or execute this script with pauses.\n${format}\n`;
 const groups=[['WRITE',m.writes],['SELECT',m.selects],...(m.transactions?[['TRANSACTION',m.transactions]]:[]),['CLEANUP',m.deletes],...(m.slug==='soha'?[['DDL',ddlSteps]]:[])];
 for(const [group,steps] of groups){for(const step of steps){text+=`\n-- ${group}: ${step.title}\nPROMPT ${step.title}\n${step.sql};\nPAUSE Explain this result then press Enter to continue\n`;}}
 text+='\nPROMPT Module finished. Your temporary records have been removed.\n';
 writeFileSync(`sql/members/${m.slug}.sql`,text);
}
if(process.argv.includes('--copy')){
 const mkdir=spawnSync('docker',['exec','oracle-free','mkdir','-p','/tmp/veats-members'],{encoding:'utf8'});
 if(mkdir.status!==0)throw Error('Cannot prepare Oracle container directory. Start Docker and oracle-free first.');
 const r=spawnSync('docker',['cp','sql/members/.','oracle-free:/tmp/veats-members'],{encoding:'utf8'});
 if(r.status!==0)throw Error('Could not copy scripts. Start Docker Desktop and oracle-free first.');
 console.log('Five SQL worksheets copied to /tmp/veats-members inside oracle-free. Open SQL*Plus and use your own worksheet.');
}else console.log('Generated five independent interactive SQL worksheets in sql/members.');
