import oracledb from 'oracledb';
const state=globalThis as unknown as {veatsOraclePool?:Promise<oracledb.Pool>};
export async function connection() {
 if(!process.env.ORACLE_USER || !process.env.ORACLE_PASSWORD) throw new Error('Oracle is not configured');
 state.veatsOraclePool ??= oracledb.createPool({user:process.env.ORACLE_USER,password:process.env.ORACLE_PASSWORD,connectString:process.env.ORACLE_CONNECT_STRING||'127.0.0.1:1521/FREEPDB1',poolMin:0,poolMax:5,poolIncrement:1}).catch(e=>{state.veatsOraclePool=undefined;throw e});
 const c=await (await state.veatsOraclePool).getConnection();c.callTimeout=10000;return c;
}
export async function query(sql:string,binds:oracledb.BindParameters={}) {
 const c=await connection();try {const r=await c.execute<Record<string,unknown>>(sql,binds,{outFormat:oracledb.OUT_FORMAT_OBJECT,maxRows:500});return (r.rows||[]).map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k.toLowerCase(),v])));}finally{await c.close()}
}
