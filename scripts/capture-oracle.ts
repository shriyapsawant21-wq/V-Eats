import oracledb from 'oracledb';
import {writeFileSync} from 'node:fs';
import {reports} from '../lib/reports.ts';
const c=await oracledb.getConnection({user:process.env.ORACLE_USER,password:process.env.ORACLE_PASSWORD,connectString:process.env.ORACLE_CONNECT_STRING});
const outputs:{title:string;sql:string;rows:unknown[];rowsAffected?:number}[]=[];
async function execute(title:string,sql:string,binds:oracledb.BindParameters={}){const r=await c.execute(sql,binds,{outFormat:oracledb.OUT_FORMAT_OBJECT});outputs.push({title,sql,rows:r.rows||[],rowsAffected:r.rowsAffected});return r;}
let scratch=false;
try{
 for(const r of reports)await execute(r.title,r.sql,r.binds);
 const id='CAPTURE_'+Date.now();
 await execute('INSERT category',`INSERT INTO category(category_id,category_name) VALUES (:id,:name)`,{id,name:id});
 await c.commit();outputs.push({title:'COMMIT inserted record',sql:'COMMIT',rows:[{committed:true}]});
 await execute('Read committed insert','SELECT * FROM category WHERE category_id=:id',{id});
 await execute('SAVEPOINT','SAVEPOINT before_update');
 await execute('UPDATE category','UPDATE category SET category_name=:name WHERE category_id=:id',{id,name:id+'_UPDATED'});
 await execute('Read updated value','SELECT * FROM category WHERE category_id=:id',{id});
 await execute('ROLLBACK TO SAVEPOINT','ROLLBACK TO before_update');
 await execute('Read restored value','SELECT * FROM category WHERE category_id=:id',{id});
 await execute('DELETE category','DELETE FROM category WHERE category_id=:id',{id});
 await execute('Read after DELETE','SELECT COUNT(*) AS record_count FROM category WHERE category_id=:id',{id});
 await c.rollback();outputs.push({title:'ROLLBACK deletion',sql:'ROLLBACK',rows:[{rolledBack:true}]});
 await execute('Read restored row after ROLLBACK','SELECT * FROM category WHERE category_id=:id',{id});
 await execute('Final DELETE','DELETE FROM category WHERE category_id=:id',{id});await c.commit();
 await execute('Committed DELETE verified','SELECT COUNT(*) AS record_count FROM category WHERE category_id=:id',{id});
 await execute('CREATE scratch table','CREATE TABLE veats_ddl_demo (demo_id NUMBER PRIMARY KEY, note VARCHAR2(40))');scratch=true;
 await execute('ALTER scratch table','ALTER TABLE veats_ddl_demo ADD created_on DATE DEFAULT SYSDATE');
 await execute('INSERT scratch row',"INSERT INTO veats_ddl_demo(demo_id,note) VALUES (1,'DDL demonstration')");await c.commit();
 await execute('SELECT scratch row','SELECT * FROM veats_ddl_demo');
 await execute('TRUNCATE scratch table','TRUNCATE TABLE veats_ddl_demo');
 await execute('Verify TRUNCATE','SELECT COUNT(*) AS record_count FROM veats_ddl_demo');
 await execute('DROP scratch table','DROP TABLE veats_ddl_demo PURGE');scratch=false;
 const timestamp=new Date().toISOString();
 writeFileSync('docs/oracle-outputs.json',JSON.stringify({executedAt:timestamp,database:'Oracle FREEPDB1 / VEATS_APP',outputs},null,2));
 let md=`# Oracle execution outputs\n\nExecuted: ${timestamp}\n\nThese are captured outputs from Oracle, not predicted results. All menus/prices/allergen labels are sample data.\n`;
 for(const r of outputs)md+=`\n## ${r.title}\n\n\`\`\`sql\n${r.sql};\n\`\`\`\n\nRows affected: ${r.rowsAffected??'n/a'}\n\n\`\`\`json\n${JSON.stringify(r.rows,null,2)}\n\`\`\`\n`;
 writeFileSync('docs/oracle-outputs.md',md);
 writeFileSync('sql/03-queries.sql',`SET ECHO ON\nSET PAGESIZE 1000\nSET LINESIZE 220\nSET TRIMSPOOL ON\nCOLUMN restaurant_name FORMAT A30\nCOLUMN food_name FORMAT A25\nCOLUMN cuisine_name FORMAT A15\nCOLUMN type_name FORMAT A16\nCOLUMN listed_allergens FORMAT A28\nCOLUMN restaurant FORMAT A30\nCOLUMN location FORMAT A35\nCOLUMN table_name FORMAT A18\nCOLUMN column_name FORMAT A22\nCOLUMN constraint_name FORMAT A28\nCOLUMN constraint_type FORMAT A5\nCOLUMN status FORMAT A10\nCOLUMN data_type FORMAT A12\nCOLUMN nullable FORMAT A8\nSPOOL query-output.txt\nVARIABLE term VARCHAR2(100)\nEXEC :term := '%dosa%';\n`+reports.map(r=>`\nPROMPT === ${r.title} ===\nPROMPT ${r.concept}\nPROMPT ${r.sql};\n${r.sql};\n`).join('')+'\nSPOOL OFF\n');
 console.log(`Captured ${outputs.length} executions to docs/oracle-outputs.md and .json.`);
}finally{if(scratch)await c.execute('DROP TABLE veats_ddl_demo PURGE');await c.close()}
