import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const tests=['audit-multi-assignment','audit-capacity-method','audit-foundation-contracts','pilot-acceptance','pilot-planning','pilot-methodology','pilot-data-evidence','pilot-automation-methods','workspace','workbench'].map(x=>'tests/'+x+'.test.mjs');
console.log('Engineering checks: real API handlers and SQLite via in-process test transport. No browser/network or professional acceptance is inferred.');
const options={cwd:root,env:{...process.env,AUDIT_TEST_TRANSPORT:'in-process'},stdio:'inherit'};
for(const args of [['--test',...tests],['--test','--test-name-pattern','G09 (named local|grant revocation|queues|supported backup|actual named|independent named|unknown local|explicit shared-team)','tests/pilot-local-identity.test.mjs']]){
 const result=spawnSync(process.execPath,[...process.execArgv,...args],options);if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
}
console.log('Browser/native reader/live HTTP and representative operating acceptance remain separate.');
