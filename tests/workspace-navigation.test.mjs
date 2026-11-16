import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readWorkspaceRoute,workspaceUrl,paperAttention} from '../src/lib/workspace-navigation.ts';

test('work links preserve engagement and form identities, including punctuation and Mongolian labels',()=>{
 const route={engagement:'E/a&b',page:'workpapers',paper:'Маягт 4.1.A1/2026'};
 const url=workspaceUrl(route,'/');
 assert.deepEqual(readWorkspaceRoute(url.slice(url.indexOf('?'))),route);
 assert.equal(readWorkspaceRoute('?engagement=firm&view=constructor').page,'home');
 assert.equal(readWorkspaceRoute('?engagement=firm').engagement,null);
 assert.equal(new URL('https://example.test'+workspaceUrl({...route,page:'review'})).searchParams.has('paper'),false);
});
test('queue readiness keeps blocked, returned, submitted and reviewed work distinct',()=>{
 const paper={status:'submitted',notes:[]};
 assert.equal(paperAttention(paper),'review');
 assert.equal(paperAttention({...paper,fieldGap:'Missing source'}),'blocked');
 assert.equal(paperAttention({...paper,status:'changed'}),'returned');
 assert.equal(paperAttention({...paper,status:'reviewed'}),'reviewed');
 assert.equal(paperAttention({...paper,status:'not_started'}),'prepare');
});

test('queue and stage links survive paper entry and reject unrelated or invalid filters',()=>{
 const route={engagement:'E-1',page:'workpapers',paper:'3.1.2',filter:'returned',stage:''};
 const url=workspaceUrl(route,'/');assert.deepEqual(readWorkspaceRoute(url.slice(url.indexOf('?'))),route);
 assert.equal(readWorkspaceRoute('?view=review&filter=returned&stage=3').filter,'returned');
 assert.equal(readWorkspaceRoute('?view=review&filter=constructor&stage=8').filter,undefined);
 assert.equal(readWorkspaceRoute('?view=home&filter=returned&stage=3').stage,undefined);
 assert.equal(new URL('https://example.test'+workspaceUrl({...route,page:'home'})).searchParams.has('filter'),false);
});
