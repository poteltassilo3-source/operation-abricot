/* ---------- partie (tenue par un seul ordinateur, élu automatiquement) ---------- */
function newGame(){const seed=1+Math.floor(Math.random()*90000);
 return {ph:'lobby',pt:0,dur:0,seed,deck:buildDeck(seed),fl:Array(NCARDS).fill(0),turn:-1,cur:-1,ans:[-1,-1,-1,-1],at:[0,0,0,0],ao:[],sc:[0,0,0,0],gain:[0,0,0,0],dbl:[0,0,0,0],who:['','','',''],rd:[0,0,0,0],en:0,act:null,nq:0,sit:sitOrder(seed),si:-1,rd2:[0,0,0,0]};}
const GM={S:null};
function gph(p,d){const S=GM.S;S.ph=p;S.pt=0;S.dur=d||0;S.en++;}
function joined(){return CHARS.filter(c=>GM.S.who[c]);}
function refreshWho(){const S=GM.S;const w=['','','',''];
 for(const p of PEERS){const q=p.presence||{};if(q.pl===1&&q.ch>=0&&q.ch<4&&!w[q.ch])w[q.ch]=String(q.nm||HEROES[q.ch].name).slice(0,14);}
 /* un joueur parti en cours de partie garde sa place (et sa tour) */
 for(let c=0;c<4;c++){if(!w[c]&&S.ph!=='lobby'&&S.ph!=='rules'&&S.sc[c]!==0)w[c]=S.who[c]?S.who[c]+' (parti)':'';}
 S.who=w;}
function online(c){return PEERS.some(p=>{const q=p.presence||{};return q.pl===1&&q.ch===c;});}
function nextTurn(){const S=GM.S;const j=joined();if(!j.length){gph('end');return;}
 if(S.fl.every(x=>x)){S.turn=-1;S.cur=-1;gph('r2rules');return;}
 let t=S.turn;for(let k=0;k<4;k++){t=(t+1)%4;if(j.includes(t)&&online(t))break;}
 S.turn=t;S.cur=-1;S.act=null;gph('pick',DUR.pick);}
function pickCard(i){const S=GM.S;if(S.ph!=='pick'||i<0||i>=NCARDS||S.fl[i])return;S.cur=i;S.fl[i]=1;const card=S.deck[i];
 S.ans=[-1,-1,-1,-1];S.at=[0,0,0,0];S.ao=[];S.gain=[0,0,0,0];
 if(card[0]>=100){applyAction(card[0]-100);gph('act',DUR.act);}else{S.nq++;gph('q',DUR.q);}}
function applyAction(k){const S=GM.S,A=ACTIONS[k],me=S.turn,j=joined();const g=[0,0,0,0];
 if(A.k==='self')g[me]=A.v;else if(A.k==='all')j.forEach(c=>g[c]=A.v);
 else if(A.k==='lead'){let best=-1;j.forEach(c=>{if(best<0||S.sc[c]>S.sc[best])best=c;});if(best>=0)g[best]=A.v;}
 else if(A.k==='dbl')S.dbl[me]=1;
 for(let c=0;c<4;c++)S.sc[c]=Math.max(0,S.sc[c]+g[c]);S.gain=g;S.act=k;}
function answer(c,a){const S=GM.S;if((S.ph!=='q'&&S.ph!=='r2q')||c<0||c>3||!S.who[c]||S.ans[c]>=0||a<0||a>2)return;S.ans[c]=a;S.at[c]=Math.round(S.pt*10)/10;S.ao.push(c);S.en++;
 const live=joined().filter(online);if(live.every(x=>S.ans[x]>=0))(S.ph==='r2q'?reveal2():reveal());}
function reveal(){const S=GM.S;const v=qView(S.deck[S.cur]);const bonus=[100,50,25,0];let rank=0;
 S.gain=[0,0,0,0];for(const c of S.ao){if(S.ans[c]===v.ok){let p=100+bonus[Math.min(3,rank)];rank++;if(S.dbl[c]){p*=2;}S.gain[c]=p;S.sc[c]+=p;}
  if(S.dbl[c])S.dbl[c]=0;}
 gph('rev',DUR.rev);}
function startSit(i){const S=GM.S;S.si=i;S.ans=[-1,-1,-1,-1];S.at=[0,0,0,0];S.ao=[];S.gain=[0,0,0,0];gph('r2q',DUR2.q);}
function reveal2(){const S=GM.S;const ok=SITUATIONS[S.sit[S.si]][2];const bonus=[100,50,25,0];let rank=0;S.gain=[0,0,0,0];
 for(const c of S.ao){if(S.ans[c]===ok){const p=100+bonus[Math.min(3,rank)];rank++;S.gain[c]=p;S.sc[c]+=p;}}gph('r2rev',DUR2.rev);}
function skip(){const S=GM.S;const free=S.fl.map((f,i)=>f?-1:i).filter(i=>i>=0);
 if(S.ph==='lobby'){if(joined().length)gph('rules');}else if(S.ph==='rules')nextTurn();else if(S.ph==='r2rules')startSit(0);
 else if(S.ph==='pick'){if(free.length)pickCard(free[Math.floor(Math.random()*free.length)]);}
 else if(S.ph==='q')reveal();else if(S.ph==='rev'||S.ph==='act')nextTurn();
 else if(S.ph==='r2q')reveal2();else if(S.ph==='r2rev'){if(S.si+1>=NSIT)gph('end');else startSit(S.si+1);}}
function hostAct(q,cmd,a){const S=GM.S;if(!S)return;
 if(q.pres===1){if(cmd==='skip'||(cmd==='go'&&a===S.ph))skip();else if(cmd==='reset'){GM.S=newGame();refreshWho();}return;}
 const c=q.ch;if(typeof c!=='number'||c<0||c>3)return;
 if(cmd==='pk'&&S.ph==='pick'&&c===S.turn)pickCard(a);
 else if(cmd==='an')answer(c,a);
 else if(cmd==='rd2'&&S.ph==='r2rules'){S.rd2[c]=1;S.en++;if(joined().filter(online).every(x=>S.rd2[x]))startSit(0);}
 else if(cmd==='rd'&&S.ph==='rules'){S.rd[c]=1;S.en++;if(joined().filter(online).every(x=>S.rd[x]))nextTurn();}
 else if(cmd==='go'&&a===S.ph){if(S.ph==='lobby'){if(joined().length)gph('rules');}else if(S.ph==='rules')nextTurn();else if(S.ph==='r2rules')startSit(0);}}
function hostStep(dt){const S=GM.S;if(!S)return;S.pt+=dt;refreshWho();
 if(S.ph==='pick'&&S.turn>=0&&!online(S.turn)&&S.pt>2){const free=S.fl.map((f,i)=>f?-1:i).filter(i=>i>=0);pickCard(free[Math.floor(Math.random()*free.length)]);return;}
 if(!S.dur||S.pt<S.dur)return;
 if(S.ph==='pick'){const free=S.fl.map((f,i)=>f?-1:i).filter(i=>i>=0);pickCard(free[Math.floor(Math.random()*free.length)]);}
 else if(S.ph==='q')reveal();
 else if(S.ph==='rev'||S.ph==='act')nextTurn();
 else if(S.ph==='r2q')reveal2();
 else if(S.ph==='r2rev'){if(S.si+1>=NSIT)gph('end');else startSit(S.si+1);}}
