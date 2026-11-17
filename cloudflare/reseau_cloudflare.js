/* Remplace la connexion `room` des pages Claude par le serveur Cloudflare (WebSocket /ws).
 * Même interface : room.presence(patch), room.onPeers(cb), peers = [{peer, presence, isMe, sameTab}]. */
(function(){
 if(window.claude&&typeof window.claude.use==='function')return;
 var peer=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
 var salle=((new URLSearchParams(location.search).get('salle'))||'abricot').replace(/[^a-zA-Z0-9-]/g,'').slice(0,40)||'abricot';
 var mine={},mineJson='{}',others={},hs=[],errs=[],ws=null,isOpen=false,wait=1000,pending=false,everOpen=false;
 function snapshot(){var ps=[{peer:peer,presence:mine,isMe:true,sameTab:true,kind:'viewer',guest:false}];
  for(var k in others)ps.push({peer:k,presence:others[k].presence,isMe:false,sameTab:false,kind:'viewer',guest:false});return ps;}
 function notify(){if(pending)return;pending=true;setTimeout(function(){pending=false;var ps=snapshot();
  hs.forEach(function(h){try{h({peers:ps,joined:[],left:[],updated:[]});}catch(e){console.error(e);}});},0);}
 function send(){if(isOpen&&ws){try{ws.send(JSON.stringify({t:'p',p:mineJson}));}catch(e){}}}
 function setOther(p,json){var o=others[p];if(o){o.ts=Date.now();if(o.json===json)return false;}var v;try{v=JSON.parse(json);}catch(e){return false;}others[p]={json:json,presence:v,ts:Date.now()};return true;}
 function connect(){var proto=location.protocol==='https:'?'wss:':'ws:';
  ws=new WebSocket(proto+'//'+location.host+'/ws?salle='+encodeURIComponent(salle)+'&peer='+peer);
  ws.onopen=function(){isOpen=true;everOpen=true;wait=1000;send();};
  ws.onmessage=function(e){var d;try{d=JSON.parse(e.data);}catch(x){return;}
   if(d.t==='all'){var seen={};(d.list||[]).forEach(function(x){seen[x.peer]=1;setOther(x.peer,x.p);});var cut=Date.now();
    /* absents de la liste : on attend 3 s qu'ils se renvoient avant de les retirer */
    setTimeout(function(){var ch=false;for(var k in others)if(!seen[k]&&others[k].ts<=cut){delete others[k];ch=true;}if(ch)notify();},3000);notify();}
   else if(d.t==='p'){if(setOther(d.peer,d.p))notify();}
   else if(d.t==='bye'){if(others[d.peer]){delete others[d.peer];notify();}}
   else if(d.t==='hi'){send();}};
  ws.onclose=function(){isOpen=false;ws=null;setTimeout(connect,wait);wait=Math.min(5000,wait*1.5);};
  ws.onerror=function(){};}
 setInterval(function(){if(isOpen&&ws){try{ws.send('{"t":"ping"}');}catch(e){}}},15000);
 var room={
  presence:function(patch){for(var k in patch){if(patch[k]===null||patch[k]===undefined)delete mine[k];else mine[k]=patch[k];}
   mineJson=JSON.stringify(mine);mine=JSON.parse(mineJson);send();notify();return Promise.resolve();},
  onPeers:function(h,onErr){hs.push(h);if(onErr)errs.push(onErr);notify();return function(){hs=hs.filter(function(x){return x!==h;});};},
  peers:snapshot,emit:function(){return Promise.resolve();},on:function(){return function(){};},connected:function(){return isOpen;}};
 window.claude={use:function(name){if(name!=='room')return Promise.resolve(null);
  if(!ws)connect();
  return new Promise(function(res){var t0=Date.now();(function chk(){if(everOpen)res(room);else if(Date.now()-t0>10000)res(null);else setTimeout(chk,100);})();});}};
})();
