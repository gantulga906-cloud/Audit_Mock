import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('out');
const pilotMode = process.argv.includes('--pilot');
const port = Number(process.argv.slice(2).find(arg => arg !== '--pilot') ?? (pilotMode ? 3004 : 3000));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.woff2': 'font/woff2' };
try { await stat(resolve(root, 'index.html')); } catch { console.error('Build the prototype first: npm run build'); process.exit(1); }
const pilot = pilotMode
  ? (await import('./pilot-server.mjs')).createPilot({ database: resolve(process.env.AUDIT_PILOT_DB ?? '.audit-pilot/workspace.sqlite') })
  : null;

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (pilot && await pilot.handle(request, response, url)) return;
    const pathname = decodeURIComponent(url.pathname);
    let file = resolve(root, pathname === '/pilot' || pathname === '/pilot/' ? 'pilot.html' : '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
    catch { response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile(resolve(root, '404.html'))); return; }
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(await readFile(file));
  } catch { if (!response.headersSent) response.writeHead(400); response.end(); }
}).listen(port, '127.0.0.1', () => {
  console.log(pilot ? `Audit pilot: http://127.0.0.1:${port}/pilot` : `Audit prototype: http://127.0.0.1:${port}`);
  if (pilot?.setupCode) console.log('One-time setup code: ' + pilot.setupCode);
});
