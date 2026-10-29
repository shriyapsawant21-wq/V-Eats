import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {members} from './member-demo-data.mjs';
import {ddlSteps} from './prepare-member-demos.mjs';
const lines=(path)=>readFileSync(path,'utf8').split(/\r?\n/);
const at=(path,text)=>{const n=lines(path).findIndex(l=>l.includes(text));if(n<0)throw Error(`Missing reference: ${path} ${text}`);return n+1;};
const schema=lines('sql/01-schema.sql');
for(const m of members){
 m.schemaRefs=m.tables.map(table=>{const start=schema.findIndex(l=>l.startsWith('CREATE TABLE '+table.toLowerCase()+' '));if(start<0)throw Error('Missing table');let end=start;while(!schema[end].trim().endsWith(');'))end++;return {file:'sql/01-schema.sql',lines:start===end?String(start+1):`${start+1} to ${end+1}`,what:`${table} columns and database constraints`};});
 m.refs=[...m.schemaRefs,{file:'lib/entities.ts',lines:m.entityLines.join(', '),what:'Your table field allowlist and primary-key identifiers'},
 {file:'lib/oracle.ts',lines:`${at('lib/oracle.ts','import oracledb')} and ${at('lib/oracle.ts','oracledb.createPool')}`,what:'Driver import and pool creation using server-side environment variables'},
 {file:'lib/oracle.ts',lines:String(at('lib/oracle.ts','c.execute<Record')),what:'Read-query execution with bind parameters; finally closes the connection'},
 {file:'app/api/manage/route.ts',lines:`${at('app/api/manage/route.ts','export async function GET')} to ${at('app/api/manage/route.ts','ORDER BY ${def.keys')}`,what:'Shared search and display SELECT construction'},
 {file:'app/api/manage/route.ts',lines:String(at('app/api/manage/route.ts','sql=`INSERT')),what:'Shared INSERT builder with bind placeholders'},
 {file:'app/api/manage/route.ts',lines:String(at('app/api/manage/route.ts',m.slug==='asmi'?'sql=`UPDATE has_allergen':'else{const changes=')),what:m.slug==='asmi'?'Relationship UPDATE uses the old composite key':'Shared UPDATE builder; primary keys stay fixed'},
 {file:'app/api/manage/route.ts',lines:String(at('app/api/manage/route.ts','sql=`DELETE')),what:'Shared DELETE builder constrained by primary-key fields'},
 {file:'app/api/manage/route.ts',lines:`${at('app/api/manage/route.ts','const result=await c.execute')} to ${at('app/api/manage/route.ts','}catch(e){if(c)')}`,what:'Execute actual SQL; commit success; rollback failure; close connection'},
 {file:'lib/db.ts',lines:m.catalogLines,what:'Read your module into the discovery catalog'},
 {file:`sql/members/${m.slug}.sql`,lines:'See statement references on your query pages',what:'Your command-line demonstration worksheet; not a separate JDBC implementation'}];
 const worksheet=readFileSync(`sql/members/${m.slug}.sql`,'utf8');
 for(const group of ['writes','selects','transactions','deletes'])for(const step of m[group]||[]){const i=worksheet.indexOf(step.sql);if(i<0)throw Error('Missing SQL reference');step.file=`sql/members/${m.slug}.sql`;step.line=worksheet.slice(0,i).split('\n').length;step.endLine=step.line+step.sql.split('\n').length-1;}
 const reports={shriya:['summary','functions'],trisha:['milk-free','set'],tanisi:['set','functions'],asmi:['allergens','milk-free'],soha:['value','below-average','compare']}[m.slug];
 m.refs.push({file:'lib/reports.ts',lines:reports.map(id=>at('lib/reports.ts',`id:'${id}'`)).join(', '),what:'Related existing application report queries; independent of your new worksheet'});
}
const results=JSON.parse(readFileSync('docs/member-demo/verified-results.json','utf8'));
writeFileSync('docs/member-demo/guide-content.json',JSON.stringify({members,ddlSteps,results,sourceCommit:execFileSync('git',['rev-parse','--short','HEAD'],{encoding:'utf8'}).trim(),generatedAt:new Date().toISOString()},null,2));
console.log('Verified all member file/line references and exported guide content.');
