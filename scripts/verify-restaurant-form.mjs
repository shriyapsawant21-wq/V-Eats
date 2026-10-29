import assert from 'node:assert/strict';
const base=process.env.VEATS_BASE_URL||'http://localhost:3000';
const session=await fetch(base+'/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:process.env.ADMIN_TOKEN})});
const cookie=session.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie,'Admin session required');
const headers={'Content-Type':'application/json',Origin:base,Cookie:cookie};
const id='FORM_'+Date.now();
const record={restaurant_id:id,restaurant_name:id,block:'GDN',landmark:'Regression test',must_have:'',image:'',source_url:'',source_note:''};
async function request(method,body){const response=await fetch(base+'/api/manage',{method,headers,body:JSON.stringify({entity:'restaurant',record:body})});return {status:response.status,data:await response.json()};}
let inserted=false;
try{
 let result=await request('POST',{...record,restaurant_id:''});assert.equal(result.status,400);assert.equal(result.data.field,'restaurant_id');assert.match(result.data.error,/restaurant id/i);
 result=await request('POST',{...record,restaurant_name:'   '});assert.equal(result.status,400);assert.equal(result.data.field,'restaurant_name');
 result=await request('POST',{...record,must_have:'[Dosa]'});assert.equal(result.status,400);assert.equal(result.data.field,'must_have');
 result=await request('POST',{...record,source_url:'www.example.com'});assert.equal(result.status,400);assert.equal(result.data.field,'source_url');
 result=await request('POST',record);assert.equal(result.status,200);inserted=true;
 result=await request('PUT',{...record,must_have:'Dosa, Coffee'});assert.equal(result.status,200);
 const response=await fetch(base+'/api/manage?entity=restaurant&q='+id,{headers});const {rows}=await response.json();assert.equal(rows.length,1);assert.deepEqual(JSON.parse(rows[0].must_have),['Dosa','Coffee']);
 console.log('Restaurant form regression passed: blank optional fields, missing required fields, malformed JSON, invalid URL and plain dish lists.');
}finally{if(inserted){const removed=await request('DELETE',record);assert.equal(removed.status,200);console.log('Temporary restaurant removed.');}}
