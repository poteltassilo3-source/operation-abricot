/* ---------- réseau, accueil, règles, boucles ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let room=null,PEERS=[],mode='title',ST=null,PREV=null,lastSt=null,acts=[],aseq=0,seenA={},hostMode=false,hostPub=0;
const me={ch:-1,nm:'',pres:false};
function clean(s){return String(s||'').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g,'').trim().slice(0,14);}
function pubMe(){if(!room)return;const base=me.pres?{pres:1,a:acts,pl:null,ch:null}:{pl:1,ch:me.ch,nm:me.nm,a:acts,pres:null};
 room.presence({...base,hp:hostMode?1:null,st:hostMode&&GM.S?JSON.parse(JSON.stringify(GM.S)):null}).catch(()=>{});}
function sendAct(cmd,a){sfx(520,.04,'square',.03);
 if(hostMode&&GM.S){hostAct(me.pres?{pres:1}:{ch:me.ch},cmd,a==null?null:a);hostTick(0,true);return;}
 acts.push([++aseq,cmd,a==null?null:a]);if(acts.length>12)acts.shift();pubMe();}
function players(){return PEERS.filter(p=>{const q=p.presence||{};return q.pl===1&&typeof q.ch==='number'&&q.ch>=0&&q.ch<4;});}
function presenters(){return PEERS.filter(p=>(p.presence||{}).pres===1).sort((a,b)=>a.peer<b.peer?-1:1);}
function myPeer(){return PEERS.find(p=>p.isMe&&p.sameTab);}
function onPeers(){if(mode==='title'){renderPick();return;}
 const pl=players(),mine=myPeer();
 const claim=PEERS.filter(p=>(p.presence||{}).hp===1&&p.presence.st);
 const prs=presenters();let h=null;if(prs.length)h=prs[0];else for(const p of (claim.length?claim:pl))if(!h||p.peer<h.peer)h=p;
 const was=hostMode;hostMode=!!(h&&mine&&h===mine);
 const actors=pl.concat(prs);
 if(hostMode&&!was){const other=claim.find(p=>p!==mine);if(!ST&&other)ST=other.presence.st;seenA={};for(const p of actors){const a=p.presence.a;if(Array.isArray(a)&&a.length)seenA[p.peer]=Math.max(...a.map(x=>x[0]));}GM.S=ST?JSON.parse(JSON.stringify(ST)):newGame();hostTick(0,true);}
 if(!hostMode&&was){GM.S=null;pubMe();}
 if(hostMode){for(const p of actors){if(p===mine)continue;const q=p.presence;if(!Array.isArray(q.a))continue;for(const x of q.a){if(!Array.isArray(x))continue;if(x[0]>(seenA[p.peer]||0)){seenA[p.peer]=x[0];hostAct(q,x[1],x[2]);}}}hostTick(0,false);}
 else{const src=h&&h.presence.st?h:claim[0];const st=src&&src.presence.st;if(st&&st!==lastSt){lastSt=st;setST(st);}}
 /* mon personnage a été pris par quelqu'un d'autre avant moi */
 if(!me.pres&&mine&&ST&&ST.ph==='lobby'){const clash=pl.find(p=>p!==mine&&p.presence.ch===me.ch&&p.peer<mine.peer);if(clash){me.ch=-1;mode='title';show('title');$('titleMsg').textContent='Ce personnage vient d’être pris. Choisis-en un autre.';pubMe();renderPick();return;}}
 updateOverlays();}
function setST(st){PREV=ST;ST=st;window.__stR=performance.now();onNewState(ST,PREV,me.pres?-1:me.ch);updateOverlays();}
function hostTick(dt,force){if(!hostMode||!GM.S)return;const before=GM.S.en;if(dt)hostStep(dt);const now=performance.now();
 if(force||GM.S.en!==before||now-hostPub>300){hostPub=now;setST(JSON.parse(JSON.stringify(GM.S)));pubMe();}}
let simLast=performance.now();
setInterval(()=>{const now=performance.now(),dt=Math.min(.5,(now-simLast)/1000);simLast=now;if(hostMode&&GM.S)hostTick(dt,false);},100);
/* ---------- écrans HTML ---------- */
function show(id){['title','lobby','plobby','rules','rules2'].forEach(x=>$(x).classList.toggle('open',x===id));$('qrOpen').style.display=id&&!me.pres?'':'none';document.body.classList.toggle('ingame',!id);document.body.classList.toggle('pres',me.pres);
 $('pbar').style.display=me.pres&&mode==='game'?'flex':'none';if(me.pres&&ST){$('pSkip').style.display=['lobby','end'].includes(ST.ph)?'none':'';$('pReset').style.display=ST.ph==='end'?'':'none';}}
function takenChars(){const t={};for(const p of players()){if(p.isMe&&p.sameTab)continue;t[p.presence.ch]=p.presence.nm||'?';}return t;}
function renderPick(){const t=takenChars();for(let c=0;c<4;c++){const el=$('ch'+c),tk=t[c];el.classList.toggle('taken',tk!=null);el.setAttribute('aria-disabled',tk!=null?'true':'false');
 if(tk!=null&&me.ch===c){me.ch=-1;$('titleMsg').textContent=String(tk)+' vient de prendre '+HEROES[c].name+'. Choisis un autre personnage.';}
 el.setAttribute('aria-pressed',me.ch===c?'true':'false');$('chtk'+c).textContent=tk!=null?'🔒 pris par '+tk:(me.ch===c?'✓ ton personnage':'libre');}
 const libres=CHARS.filter(c=>t[c]==null).length;$('chFull').style.display=libres?'none':'';
 $('joinBtn').disabled=!room||me.ch<0;}
function updateOverlays(){if(mode==='title')return;if(!ST){show('lobby');$('lbList').innerHTML='<p>Connexion à la partie…</p>';return;}
 const hasPres=presenters().length>0;$('lbGo').style.display=hasPres?'none':'';$('lbWait').style.display=hasPres?'':'none';$('rdForce').style.display=hasPres&&!me.pres?'none':'';$('rd2Force').style.display=hasPres&&!me.pres?'none':'';$('rdBtn').style.display=me.pres?'none':'';$('rd2Btn').style.display=me.pres?'none':'';
 $('rdForce').textContent=me.pres?'▶ Commencer la partie':'Commencer sans attendre les autres';$('rd2Force').textContent=me.pres?'▶ Commencer la manche 2':'Commencer sans attendre les autres';
 if(ST.ph==='lobby'&&me.pres){show('plobby');const n=CHARS.filter(c=>ST.who[c]).length;
  $('plList').innerHTML=CHARS.map(c=>{const nm=ST.who[c];return '<div class="slot'+(nm?' on':'')+'" style="--c:'+HEROES[c].color+'"><canvas id="pc'+c+'" width="64" height="84"></canvas><b style="color:'+HEROES[c].color+'">'+HEROES[c].name+'</b><span>'+(nm?esc(nm):'en attente…')+'</span></div>';}).join('');
  CHARS.forEach(c=>{const cc=$('pc'+c).getContext('2d');cc.imageSmoothingEnabled=false;cc.globalAlpha=ST.who[c]?1:.3;drawChar(cc,32,78,HEROES[c].look,'down',0,false,1.9);});
  $('plGo').disabled=n<1;$('plGo').textContent='▶ Afficher les règles ('+n+'/4 joueurs)';}
 else if(ST.ph==='lobby'){show('lobby');
  $('lbList').innerHTML=CHARS.map(c=>{const n=ST.who[c];return '<div class="slot'+(n?' on':'')+'" style="--c:'+HEROES[c].color+'"><canvas id="lc'+c+'" width="64" height="84"></canvas><b style="color:'+HEROES[c].color+'">'+HEROES[c].name+'</b><span>'+(n?esc(n)+(c===me.ch?' (toi)':''):'en attente…')+'</span></div>';}).join('');
  CHARS.forEach(c=>{const cc=$('lc'+c).getContext('2d');cc.imageSmoothingEnabled=false;cc.globalAlpha=ST.who[c]?1:.3;drawChar(cc,32,78,HEROES[c].look,'down',0,false,1.9);});
  const n=CHARS.filter(c=>ST.who[c]).length;$('lbGo').disabled=n<1;$('lbGo').textContent='Tout le monde est là : voir les règles ('+n+'/4)';}
 else if(ST.ph==='rules'){show('rules');const r=CHARS.filter(c=>ST.who[c]);
  $('rdList').innerHTML=r.map(c=>'<span class="pill" style="--c:'+HEROES[c].color+'">'+(ST.rd[c]?'✓ ':'… ')+HEROES[c].name+'</span>').join('');
  $('rdBtn').disabled=!!ST.rd[me.ch];$('rdBtn').textContent=ST.rd[me.ch]?'✓ Prêt ! On attend les autres…':'J’ai compris, je suis prêt !';}
 else if(ST.ph==='r2rules'){show('rules2');const r=CHARS.filter(c=>ST.who[c]);
  $('rd2List').innerHTML=r.map(c=>'<span class="pill" style="--c:'+HEROES[c].color+'">'+(ST.rd2[c]?'✓ ':'… ')+HEROES[c].name+' · '+ST.sc[c]+' pts</span>').join('');
  $('rd2Btn').disabled=!!ST.rd2[me.ch];$('rd2Btn').textContent=ST.rd2[me.ch]?'✓ Prêt ! On attend les autres…':'J’ai compris, c’est parti !';}
 else show(null);}
const _upd=updateOverlays;
(function(){const g=$('chars');
 CHARS.forEach(c=>{const h=HEROES[c];const d=document.createElement('button');d.className='char';d.id='ch'+c;d.style.setProperty('--c',h.color);
  d.innerHTML='<canvas width="64" height="84"></canvas><b style="color:'+h.color+'">'+h.name+'</b><span class="tk" id="chtk'+c+'">libre</span>';
  d.onclick=()=>{if(d.classList.contains('taken')){$('titleMsg').textContent=h.name+' est déjà pris. Choisis un autre personnage.';d.classList.remove('nope');void d.offsetWidth;d.classList.add('nope');sBad();return;}$('titleMsg').textContent='';me.ch=c;renderPick();};g.appendChild(d);const cc=d.querySelector('canvas').getContext('2d');cc.imageSmoothingEnabled=false;drawChar(cc,32,78,h.look,'down',0,false,1.9);});
 $('joinBtn').onclick=()=>{if(me.ch<0)return;sWin();me.nm=clean($('pname').value)||HEROES[me.ch].name;mode='game';acts=[];aseq=0;pubMe();show('lobby');onPeers();updateOverlays();};
 const goPres=()=>{if(!room)return;me.pres=true;me.ch=-1;mode='game';acts=[];aseq=0;pubMe();show('plobby');onPeers();updateOverlays();};
 $('presBtn').onclick=goPres;window.__goPres=goPres;
 $('plGo').onclick=()=>sendAct('go','lobby');
 $('pSkip').onclick=()=>sendAct('skip');$('pReset').onclick=()=>sendAct('reset');
 $('pQr').onclick=()=>$('qrmodal').classList.add('open');
 $('pMute').onclick=()=>{window.__mute=!window.__mute;$('pMute').textContent=window.__mute?'🔇':'🔊';};
 $('pFull').onclick=()=>{const s=document.querySelector('.stage');if(s.requestFullscreen)s.requestFullscreen().catch(()=>{});};
 $('lbGo').onclick=()=>sendAct('go','lobby');
 $('rdBtn').onclick=()=>{sendAct('rd');sWin();};
 $('rdForce').onclick=()=>sendAct('go','rules');
 $('rd2Btn').onclick=()=>{sendAct('rd2');sWin();};
 $('rd2Force').onclick=()=>sendAct('go','r2rules');
 cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;const h=HITS.find(k=>x>=k.x&&x<=k.x+k.w&&y>=k.y&&y<=k.y+k.h);V.hover=h&&typeof h.id==='number'?h.id:-1;cv.style.cursor=h?'pointer':'default';});
 cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;for(let i=HITS.length-1;i>=0;i--){const h=HITS[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){e.preventDefault();h.fn();return;}}});
 window.addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT')return;if(!ST||(ST.ph!=='q'&&ST.ph!=='r2q')||me.pres||me.ch<0)return;const k=(e.key||'').toLowerCase();const i='abc'.indexOf(k)>=0?'abc'.indexOf(k):'123'.indexOf(k);if(i>=0&&k.length===1&&ST.ans[me.ch]<0)sendAct('an',i);});
 $('qrOpen').onclick=()=>$('qrmodal').classList.add('open');$('qrClose').onclick=()=>$('qrmodal').classList.remove('open');
 initRoom();renderPick();})();
async function initRoom(){try{if(window.claude&&typeof window.claude.use==='function')room=await window.claude.use('room');}catch(e){room=null;}
 const st=$('netStatus');if(!room){st.textContent='Connexion impossible ici : ouvrez le lien partagé en étant connecté à votre compte Claude.';st.className='status bad';return;}
 st.textContent='Connecté : les autres joueurs vous voient en direct.';st.className='status ok';$('presBtn').disabled=false;renderPick();
 if(/pr[ée]sentat/i.test(decodeURIComponent(location.hash||''))&&mode==='title')window.__goPres();
 room.onPeers(ch=>{PEERS=ch.peers;onPeers();},()=>{st.textContent='Connexion perdue : rechargez la page.';st.className='status bad';});}
let last=0;
function loopShow(){if(me.pres&&ST)show(['lobby','rules','r2rules'].includes(ST.ph)?(ST.ph==='lobby'?'plobby':ST.ph==='rules'?'rules':'rules2'):null);}
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;try{tickV(dt);if(mode==='game'&&ST&&!['lobby','rules','r2rules'].includes(ST.ph)){const v=hostMode&&GM.S?GM.S:Object.assign({},ST,{pt:ST.pt+Math.min(1,(performance.now()-(window.__stR||0))/1000)});render(v,me.pres?-1:me.ch);}else{ctx.fillStyle='#0b1226';ctx.fillRect(0,0,W,H);}}catch(e){window.__err=e;console.error(e);}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
window.__dbg={SIT:SITUATIONS,qView,GM,DUR,get ST(){return ST;},me,sendAct,get hostMode(){return hostMode;}};
