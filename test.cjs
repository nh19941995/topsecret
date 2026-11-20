const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/app.js','utf8').split("$('#folderBtn').onclick=connect;")[0];
const context=vm.createContext({document:{querySelector:()=>({}),querySelectorAll:()=>[]},localStorage:{getItem:()=>null},console,structuredClone});
vm.runInContext(source,context);
function run(s){return vm.runInContext(s,context)}
assert.equal(run('doneCount()'),3);
assert.equal(run('currentStage()'),0);
run("node('sample').status='done'");assert.equal(run("complete(node('sample'))"),false);
run("node('lab').status='done'");assert.equal(run('currentStage()'),1);assert.equal(run("complete(node('sample'))"),true);
run("state.nodes.forEach(n=>n.status='done')");assert.equal(run('currentStage()'),3);
run("node('lab').status='rejected'");assert.equal(run('currentStage()'),0);assert.equal(run("complete(node('handover'))"),false);
run("state=fresh(false);state.nodes.push({id:'vl_abc_test',name:'Thí nghiệm bê tông',stage:1,folder:'02_ThiCong/abc',deps:['lab'],status:'missing',files:[]});state=validate(JSON.parse(JSON.stringify(state)))");
assert.equal(run("node('acceptance').deps.includes('vl_abc_test')"),true);
assert.throws(()=>run("state.nodes[0].files.push({path:'../secret.pdf'});validate(state)"),/Đường dẫn/);
run('state=fresh(false)');assert.equal(run('state.demo'),false);assert.equal(run('doneCount()'),0);
run("node('acceptance').deps.push('test_only');state=fresh(false)");assert.equal(run("node('acceptance').deps.includes('test_only')"),false);
console.log('Passed: dependency gating, stage progression/regression, material dependencies after portable reload, unsafe-path rejection, clean project initialization.');
