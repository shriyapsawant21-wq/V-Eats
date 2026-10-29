export class FormError extends Error {
 constructor(message:string,public field:string){super(message);this.name='FormError';}
}
export function required(value:unknown,field:string){
 if(value===null||value===undefined||!String(value).trim())throw new FormError(`Enter ${field.replaceAll('_',' ')}.`,field);
}
export function mustHave(value:unknown){
 const text=String(value??'').trim();if(!text)return '[]';
 let list:unknown;
 if(text.startsWith('[')||text.startsWith('{')){
  try{list=JSON.parse(text)}catch{throw new FormError('Enter dish names separated by commas, or a valid JSON list such as ["Dosa", "Coffee"].','must_have');}
 }else list=text.split(/[,\n]/);
 if(!Array.isArray(list)||list.some(v=>typeof v!=='string'))throw new FormError('Must-have dishes must be a list of dish names.','must_have');
 return JSON.stringify(list.map(v=>(v as string).trim()).filter(Boolean));
}
