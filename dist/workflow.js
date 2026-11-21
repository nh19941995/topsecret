(function(root){
 'use strict';
 const types={submission:'Trình duyệt',approval:'Chấp thuận',sampling:'Lấy mẫu',testing:'Thí nghiệm',acceptance:'Nghiệm thu',drawing:'Bản vẽ hoàn công',handover:'Bàn giao',task:'Công việc khác'};
 const fields={date:'Ngày văn bản',startDate:'Ngày bắt đầu',dueDate:'Hạn hoàn thành',completedAt:'Ngày hoàn tất'};
 const defaults={dueSoon:true,overdue:true,dateOrder:true,missingDate:true,blocked:true,leadDays:7};
 const status=['missing','pending','conditional','done','rejected'];
 function day(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const time=Date.parse(value+'T00:00:00Z');return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?time/86400000:null;}
 function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function infer(n){return n.id==='material'||n.id==='lab'||n.id.endsWith('_approval')?'approval':n.id==='sample'||n.id.endsWith('_sample')?'sampling':n.id==='test'||n.id.endsWith('_test')?'testing':n.id==='acceptance'?'acceptance':n.id==='drawing'?'drawing':n.id==='handover'?'handover':'submission';}
 function safePath(path){return typeof path==='string'&&path.length>0&&!path.split('/').some(p=>!p||p==='..'||p==='.'||/[\\:\x00-\x1f]/.test(p));}
 function normalize(x){x.workflowVersion=2;x.alertSettings={...defaults,...x.alertSettings};x.nodes.forEach((n,i)=>{n.type=n.type||infer(n);n.required=n.required!==false;n.order=Number.isFinite(n.order)?n.order:i;n.dateRules=n.dateRules||[];n.startDate=n.startDate||'';n.dueDate=n.dueDate||'';n.completedAt=n.completedAt||'';});return x;}
 function validateProject(x,base=[]){
  if(x?.version!==1||!Array.isArray(x.nodes)||!x.nodes.length||x.nodes.length>1000||typeof x.name!=='string'||!Array.isArray(x.history))throw Error('Tệp dự án không hợp lệ.');
  const legacy=x.workflowVersion!==2;const ids=new Set(x.nodes.map(n=>n.id));if(ids.size!==x.nodes.length)throw Error('Trùng mã đầu mục.');
  for(const d of base)if(!ids.has(d.id))throw Error('Thiếu đầu mục bắt buộc: '+d.name);
  normalize(x);
  if(legacy){const acceptance=x.nodes.find(n=>n.id==='acceptance');if(acceptance)for(const n of x.nodes)if(n.id.startsWith('vl_')&&n.id.endsWith('_test')&&!acceptance.deps.includes(n.id))acceptance.deps.push(n.id);}
  const cfg=x.alertSettings;if(!Number.isInteger(cfg.leadDays)||cfg.leadDays<0||cfg.leadDays>365)throw Error('Số ngày nhắc trước phải từ 0 đến 365.');
  for(const key of Object.keys(defaults).filter(k=>k!=='leadDays'))if(typeof cfg[key]!=='boolean')throw Error('Tùy chọn cảnh báo không hợp lệ.');
  for(const n of x.nodes){
   if(!/^[a-zA-Z0-9_]+$/.test(n.id)||typeof n.name!=='string'||!n.name.trim()||!status.includes(n.status)||!types[n.type]||![0,1,2].includes(n.stage)||!Array.isArray(n.deps)||!n.deps.every(id=>id!==n.id&&ids.has(id))||!Array.isArray(n.files)||!Array.isArray(n.dateRules))throw Error('Thông tin đầu mục không hợp lệ: '+n.name);
   if(!safePath(n.folder)||n.files.some(f=>!safePath(f.path)))throw Error('Đường dẫn tài liệu không hợp lệ.');
   for(const key of Object.keys(fields))if(n[key]&&day(n[key])===null)throw Error(fields[key]+' không hợp lệ: '+n.name);
   for(const rule of n.dateRules)if(!ids.has(rule.sourceId)||rule.sourceId===n.id||!fields[rule.sourceField]||!fields[rule.targetField]||!['after','before'].includes(rule.relation)||!Number.isInteger(rule.days)||rule.days<0||rule.days>3650||typeof rule.blocking!=='boolean')throw Error('Ràng buộc ngày không hợp lệ: '+n.name);
  }
  const visited=new Set(),active=new Set(),byId=new Map(x.nodes.map(n=>[n.id,n]));
  function visit(id){if(active.has(id))throw Error('Quan hệ phụ thuộc tạo vòng lặp. Hãy bỏ một liên kết.');if(visited.has(id))return;active.add(id);byId.get(id).deps.forEach(visit);active.delete(id);visited.add(id);}x.nodes.forEach(n=>visit(n.id));return x;
 }
 function dateFindings(n,nodes){const result=[];const push=(kind,message,blocking,sourceId)=>result.push({kind,message,blocking,sourceId,nodeId:n.id});
  if(day(n.startDate)!==null&&day(n.dueDate)!==null&&day(n.startDate)>day(n.dueDate))push('dateOrder','Ngày bắt đầu muộn hơn hạn hoàn thành.',true);
  for(const r of n.dateRules||[]){const source=nodes.find(x=>x.id===r.sourceId);if(!source){push('missingDate','Không tìm thấy hồ sơ nguồn.',r.blocking,r.sourceId);continue}const a=day(n[r.targetField]),b=day(source[r.sourceField]);
   if(a===null||b===null){push('missingDate',`Chưa đủ ngày để đối chiếu: ${fields[r.targetField]} với ${fields[r.sourceField].toLowerCase()} của ${source.name}.`,r.blocking,source.id);continue}
   const limit=b+(r.relation==='after'?r.days:-r.days),valid=r.relation==='after'?a>=limit:a<=limit;
   if(!valid)push('dateOrder',`${fields[r.targetField]} phải ${r.relation==='after'?'sau hoặc bằng':'trước hoặc bằng'} ${fields[r.sourceField].toLowerCase()} của ${source.name}${r.days?' ít nhất '+r.days+' ngày':''}.`,r.blocking,source.id);
  }return result;
 }
 function alerts(project,date=today(),isComplete=n=>n.status==='done'){const cfg={...defaults,...project.alertSettings},current=day(date),out=[];
  for(const n of project.nodes){for(const finding of dateFindings(n,project.nodes))if(cfg[finding.kind])out.push({...finding,severity:finding.blocking?'error':'warning'});
   const due=day(n.dueDate);if(!isComplete(n)&&due!==null&&current!==null){const remaining=due-current;if(remaining<0&&cfg.overdue)out.push({nodeId:n.id,kind:'overdue',severity:'warning',message:'Quá hạn '+(-remaining)+' ngày.'});else if(remaining>=0&&remaining<=cfg.leadDays&&cfg.dueSoon)out.push({nodeId:n.id,kind:'dueSoon',severity:'info',message:remaining===0?'Đến hạn hôm nay.':'Còn '+remaining+' ngày đến hạn.'});}
   const blocked=n.deps.filter(id=>{const d=project.nodes.find(x=>x.id===id);return d&&!isComplete(d)});if(cfg.blocked&&blocked.length)out.push({nodeId:n.id,kind:'blocked',severity:'info',message:'Còn '+blocked.length+' hồ sơ phụ thuộc chưa đủ.'});
  }return out;
 }
 function toTemplate(project){return {format:'hoancong-workflow-template',version:1,name:project.name+' — Mẫu quy trình',alertSettings:{...defaults,...project.alertSettings},nodes:project.nodes.map((n,i)=>({id:n.id,name:n.name,type:n.type||infer(n),stage:n.stage,folder:n.folder,deps:[...n.deps],required:n.required!==false,order:n.order??i,dateRules:structuredClone(n.dateRules||[])}))};}
 function fromTemplate(template,base=[]){if(template?.format!=='hoancong-workflow-template'||template.version!==1||!Array.isArray(template.nodes))throw Error('Không đúng định dạng template Hoàn Công.');const project={version:1,workflowVersion:2,name:template.name||'Dự án mới',code:'DA-2026',demo:false,alertSettings:template.alertSettings,history:[],nodes:template.nodes.map((n,i)=>({id:n.id,name:n.name,type:n.type,stage:n.stage,folder:n.folder,deps:n.deps,required:n.required,order:n.order??i,dateRules:n.dateRules||[],symbol:'▤',status:'missing',code:'',date:'',issuer:'',note:'',startDate:'',dueDate:'',completedAt:'',files:[]}))};return validateProject(project,base);}
 const api={types,fields,defaults,day,today,normalize,validateProject,dateFindings,alerts,toTemplate,fromTemplate};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Workflow=api;
})(globalThis);
