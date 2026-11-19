import {Readable} from 'node:stream';

// Exercise the actual API handler and SQLite transactions without a listening socket.
// This is a test transport, not evidence of browser or network conformance.
export function inProcessRequest(pilot) {
  const origin='http://127.0.0.1:18765';
  return async (path,cookie,data) => {
    const url=new URL('/api/pilot'+path,origin);
    const req=Readable.from(data===undefined?[]:[Buffer.from(JSON.stringify(data))]);
    Object.assign(req,{method:data===undefined?'GET':'POST',url:url.pathname+url.search,
      headers:{host:url.host,...(cookie&&{cookie}),...(data!==undefined&&{'content-type':'application/json',origin})},
      socket:{localPort:18765,remoteAddress:'127.0.0.1'}});
    const headers=new Headers(),chunks=[];
    let status=200,ended=false;
    const res={headersSent:false,setHeader:(key,value)=>headers.set(key,value),
      writeHead(code,values={}){status=code;for(const [key,value] of Object.entries(values))headers.set(key,value);this.headersSent=true;},
      end(value){if(value!==undefined)chunks.push(Buffer.isBuffer(value)||value instanceof Uint8Array?Buffer.from(value):Buffer.from(String(value)));ended=true;}};
    await pilot.handle(req,res,url);
    if(!ended)throw Error('API handler did not finish the in-process response: '+path);
    return new Response(Buffer.concat(chunks),{status,headers});
  };
}
