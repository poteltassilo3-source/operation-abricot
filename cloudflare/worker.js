/* Opération Abricot sur Cloudflare.
 * - Sert le jeu (dossier public/).
 * - /salle-info?salle=CODE : nombre de connectés dans la partie (0 = code inconnu).
 * - /ws?salle=CODE&peer=... : salle de jeu en direct (Durable Object), qui relaie
 *   la « présence » de chaque joueur à tous les autres, comme la connexion
 *   `room` des pages Claude. Toute la logique du jeu reste dans le navigateur. */

const MAX_MSG = 64 * 1024;
const clean = (s, n) => String(s || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, n);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/ws' || url.pathname === '/salle-info') {
      const salle = clean(url.searchParams.get('salle'), 40).toLowerCase() || 'abricot';
      const stub = env.SALLES.get(env.SALLES.idFromName(salle));
      return stub.fetch(req);
    }
    return env.ASSETS.fetch(req);
  },
};

export class Salle {
  constructor(state) {
    this.state = state;
    this.pres = new Map(); // peer -> présence (texte JSON)
  }

  async fetch(req) {
    const url = new URL(req.url);
    // nombre de personnes connectées : sert à vérifier qu'un code de partie existe
    if (url.pathname === '/salle-info') {
      return Response.json({ n: this.state.getWebSockets().length }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const peer = clean(url.searchParams.get('peer'), 32);
    if (req.headers.get('Upgrade') !== 'websocket' || !peer) {
      return new Response('WebSocket attendu', { status: 426 });
    }
    // même joueur qui se reconnecte : on ferme l'ancienne connexion
    for (const old of this.state.getWebSockets(peer)) {
      try { old.serializeAttachment({ peer, replaced: true }); old.close(4000, 'remplacé'); } catch (e) {}
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server, [peer]);
    server.serializeAttachment({ peer });

    const list = [];
    for (const [p, json] of this.pres) if (p !== peer && this.isOnline(p)) list.push({ peer: p, p: json });
    server.send(JSON.stringify({ t: 'all', list }));
    // après une mise en veille du serveur, la mémoire peut être vide : on demande à tous de se renvoyer
    this.broadcast({ t: 'hi' }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  isOnline(peer) {
    return this.state.getWebSockets(peer).some(w => {
      const a = w.deserializeAttachment();
      return !(a && a.replaced) && w.readyState === 1;
    });
  }

  broadcast(obj, except) {
    const s = JSON.stringify(obj);
    for (const w of this.state.getWebSockets()) {
      if (w === except) continue;
      try { w.send(s); } catch (e) {}
    }
  }

  webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > MAX_MSG) return;
    let d;
    try { d = JSON.parse(msg); } catch (e) { return; }
    const a = ws.deserializeAttachment();
    if (!a || a.replaced) return;
    if (d.t === 'p' && typeof d.p === 'string') {
      if (this.pres.get(a.peer) === d.p) return;
      this.pres.set(a.peer, d.p);
      this.broadcast({ t: 'p', peer: a.peer, p: d.p }, ws);
    } else if (d.t === 'ping') {
      try { ws.send('{"t":"pong"}'); } catch (e) {}
    }
  }

  gone(ws) {
    const a = ws.deserializeAttachment();
    if (!a || a.replaced) return;
    if (this.state.getWebSockets(a.peer).some(w => w !== ws && w.readyState === 1)) return;
    this.pres.delete(a.peer);
    this.broadcast({ t: 'bye', peer: a.peer }, ws);
  }

  webSocketClose(ws) { this.gone(ws); }
  webSocketError(ws) { this.gone(ws); }
}
