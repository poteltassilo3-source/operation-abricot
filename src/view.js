/* ---------- rendu du jeu ----------
 * Joueurs : les cartes en grand, sur tout l'écran (pas de tours).
 * Présentateur (écran projeté) : les tours en grand + un bandeau qui montre ce qui se passe. */
const W=960,H=600,GROUND=560;
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const V={t:0,th:[0,0,0,0],hover:-1,flip:null,lastKey:'',parts:[],pops:[],shake:0};
let HITS=[],HOX=0,PRES=false;
function hit(x,y,w,h,fn,id){HITS.push({x:x+HOX,y,w,h,fn,id});}
/* grille des joueurs : 8 × 3 grandes cartes */
const PG={gx:24,gy:66,cw:103,ch:164,sx:12,sy:14,cols:8};
function cardXY(i){const c=i%PG.cols,r=Math.floor(i/PG.cols);return [PG.gx+c*(PG.cw+PG.sx),PG.gy+r*(PG.ch+PG.sy)];}
function wrapF(s,maxW,f){ctx.font=f;const ws=String(s).split(' ');const out=[];let cur='';for(const w of ws){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){out.push(cur);cur=w;}else cur=t;}if(cur)out.push(cur);return out;}
function lines(ls,x,y,lh,f,col,al){ctx.font=f;ctx.fillStyle=col;ctx.textAlign=al||'center';ls.forEach((l,i)=>ctx.fillText(l,x,y+i*lh));}
function F(w,s){return w+' '+s+'px '+UI;}
function burst(x,y,cols,n){if(RM)n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=Math.random()*6.283,s=60+Math.random()*220;V.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-90,t:0,ttl:.7+Math.random()*.6,c:cols[i%cols.length],z:3+Math.random()*4});}}
function drawBg(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#16244a');g.addColorStop(.75,'#2a2140');g.addColorStop(1,'#3a2a2a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<50;i++){ctx.globalAlpha=.2+.3*Math.abs(Math.sin(V.t*.7+i));ctx.fillRect((i*97)%W,(i*53)%330,2,2);}ctx.globalAlpha=1;
 if(PRES){ctx.fillStyle='#4a3424';ctx.fillRect(0,GROUND,W,H-GROUND);ctx.fillStyle='#5f4530';ctx.fillRect(0,GROUND,W,6);ctx.fillStyle='#3a8a3a';ctx.fillRect(0,GROUND-4,W,5);}}
function cardBack(x,y,w,h,i,hl){const s=Math.max(1,Math.min(1.6,w/82));rrect(x,y+4,w,h,10,'rgba(0,0,0,.4)');rrect(x,y,w,h,10,hl?'#F6B26B':'#E8832A','#fff3dc',2);
 ctx.save();ctx.beginPath();ctx.rect(x+6,y+6,w-12,h-12);ctx.clip();ctx.fillStyle='rgba(255,255,255,.14)';for(let k=-4;k<14;k++){ctx.fillRect(x+k*16,y,7,h);}ctx.restore();
 rrect(x+w/2-20*s,y+h/2-22*s,40*s,44*s,20*s,'#fff3dc');txt('?',x+w/2,y+h/2+11*s,Math.round(24*s),'#c0601a','center',PX,false);txt(String(i+1),x+10,y+12+8*s,Math.round(10*s),'#fff3dc','left',PX,false);}
function cardFace(x,y,w,h,card){const isA=card[0]>=100,s=Math.max(1,Math.min(1.6,w/82));rrect(x,y,w,h,10,isA?'#3a2c5a':'#1d2a52','#5b6a95',2);ctx.globalAlpha=.85;
 if(isA){const A=ACTIONS[card[0]-100];txt(A.ico,x+w/2,y+h/2+4*s,Math.round(30*s),'#fff','center',UI,false);}else{txt('✓',x+w/2,y+h/2+10*s,Math.round(30*s),'#5b6a95','center',UI,false);}ctx.globalAlpha=1;}
function drawGrid(S,mine){for(let i=0;i<NCARDS;i++){const [x,y]=cardXY(i);
 if(S.fl[i]){cardFace(x,y,PG.cw,PG.ch,S.deck[i]);continue;}
 const can=mine&&S.ph==='pick';const hl=can&&V.hover===i;cardBack(x,y-(hl?6:0),PG.cw,PG.ch,i,hl);
 if(can)hit(x,y,PG.cw,PG.ch,()=>sendAct('pk',i),i);}}
/* zoom d'une carte de la grille vers sa position finale */
function flipRect(S,x,y,w,h){const f=V.flip&&V.flip.k===S.en?Math.min(1,V.flip.t/.45):1;if(f>=1)return [x,y,w,h,false];
 const [cx,cy]=cardXY(S.cur);const e=1-Math.pow(1-f,3);return [cx+(x-cx)*e,cy+(y-cy)*e,PG.cw+(w-PG.cw)*e,PG.ch+(h-PG.ch)*e,f<.5];}

/* ---------- les tours (écran présentateur) ---------- */
const PANEL={x:20,y:58,w:920,h:192},TMAX=GROUND-6-PANEL.y-PANEL.h-92;
function colX(c){return 120+c*240;}
function towerCX(c){return colX(c)+22;}
function towerTop(c){return GROUND-6-V.th[c];}
function drawTowers(S){const j=CHARS.filter(c=>S.who[c]);const mx=Math.max(800,...S.sc.map(s=>s+100));let lead=-1;j.forEach(c=>{if(lead<0||S.sc[c]>S.sc[lead])lead=c;});if(lead>=0&&S.sc[lead]===0)lead=-1;
 for(let c=0;c<4;c++){const cx=colX(c),on=!!S.who[c],h=HEROES[c];const target=on?Math.max(12,S.sc[c]/mx*TMAX):0;V.th[c]+=(target-V.th[c])*Math.min(1,.06*(RM?10:1));
  const th=V.th[c],tw=96,tx=towerCX(c)-tw/2;
  if(on){for(let y=GROUND-6,k=0;y>GROUND-6-th;y-=20,k++){const bh=Math.min(20,y-(GROUND-6-th));ctx.fillStyle=k%2?'#c97a2b':'#e0913a';ctx.fillRect(tx,y-bh,tw,bh);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(tx,y-2,tw,2);ctx.fillRect(tx+(k%2?48:24),y-bh,2,bh);ctx.fillRect(tx+(k%2?0:72),y-bh,2,bh);}
   ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.strokeRect(tx,GROUND-6-th,tw,th);
   const top=GROUND-6-th,fx=tx+tw/2;ctx.fillStyle='#e6ecfa';ctx.fillRect(fx-1,top-30,3,30);ctx.fillStyle=h.color;ctx.beginPath();ctx.moveTo(fx+2,top-30);ctx.lineTo(fx+28,top-23);ctx.lineTo(fx+2,top-16);ctx.fill();
   txt(String(S.sc[c]),fx,top-40,18,'#fff','center',PX);if(c===lead)txt('👑',fx,top-62,26,'#ffd23f','center',UI,false);}
  const turn=S.turn===c&&['pick','q','rev','act'].includes(S.ph);const bob=turn&&!RM?Math.sin(V.t*6)*-4:0;
  ctx.globalAlpha=on?1:.25;drawChar(ctx,cx-72,GROUND+bob,h.look,'down',V.t,false,1.5);ctx.globalAlpha=1;
  if(turn){ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(cx-82,GROUND-122);ctx.lineTo(cx-62,GROUND-122);ctx.lineTo(cx-72,GROUND-110);ctx.fill();}
  txt(h.name+(on?' · '+String(S.who[c]).slice(0,12):''),cx-10,GROUND+28,17,on?h.color:'#7f8cae','center',UI,true);}}

/* ---------- bandeau du présentateur ---------- */
function presTimer(S,x,y,col){if(!S.dur)return;const rem=Math.max(0,Math.ceil(S.dur-S.pt));txt(rem+' s',x,y,18,rem<=5?'#c0453a':(col||'#cfd8ec'),'right',PX,false);}
function presBar(S,x,y,w){if(!S.dur)return;const a=Math.min(1,S.pt/S.dur),rem=S.dur-S.pt;rrect(x,y,w,8,4,'rgba(0,0,0,.15)');rrect(x,y,Math.max(8,w*(1-a)),8,4,rem<=5?'#c0453a':'#E8832A');}
function presAnswers(S,y0,labels,cols,ok,rev,bh){const {x,w}=PANEL,gap=14,aw=(w-40-2*gap)/3;
 for(let i=0;i<3;i++){const bx=x+20+i*(aw+gap),good=rev&&i===ok;
  rrect(bx,y0,aw,bh,10,rev?(good?'#c9f1d5':'#e9e1d3'):'#fff',good?'#2f9a52':'#d8c28f',good?4:2);
  rrect(bx+10,y0+bh/2-15,30,30,15,cols[i]);txt(labels[i][0],bx+25,y0+bh/2+6,13,'#fff','center',labels[i][0].length>1?UI:PX,false);
  const tw=aw-62-(rev?60:0),tc=rev&&!good?'#8a7a66':'#2b1a0a';let al=wrapF(labels[i][1],tw,F(800,16));
  if(al.length<=2)lines(al,bx+50,y0+(al.length>1?bh/2-4:bh/2+6),19,F(800,16),tc,'left');
  else{al=wrapF(labels[i][1],tw,F(800,13)).slice(0,3);lines(al,bx+50,y0+bh/2-(al.length-1)*7.5+4,15,F(800,13),tc,'left');}
  if(rev){const who=CHARS.filter(c=>S.who[c]&&S.ans[c]===i);who.forEach((c,k)=>drawChar(ctx,bx+aw-16-k*20,y0+bh-4,HEROES[c].look,'down',V.t,false,.5));if(good&&!who.length)txt('✓',bx+aw-20,y0+bh/2+8,24,'#2f9a52','center',UI,false);}}}
function answeredTxt(S){const a=CHARS.filter(c=>S.who[c]&&S.ans[c]>=0).length,t=CHARS.filter(c=>S.who[c]).length;return a+' / '+t+' ont répondu';}
/* qui a voté : une pastille par joueur (✓ = a voté, … = réfléchit) */
function voteChips(S,xr,y){const js=CHARS.filter(c=>S.who[c]);let x=xr;
 for(let k=js.length-1;k>=0;k--){const c=js[k],h=HEROES[c],ok=S.ans[c]>=0,w=104;x-=w;
  rrect(x,y-19,w-8,28,14,ok?'#2f9a52':'#e9e1d3',ok?'#1f7a3e':'#d8c28f',2);drawChar(ctx,x+16,y+8,h.look,'down',V.t,false,.38);
  txt((ok?'✓ ':'… ')+h.name,x+30,y+1,14,ok?'#fff':'#8a7a66','left',UI,false);}}
function voteLine(S,y){const {x,w}=PANEL;const all=allVoted(S),n=CHARS.filter(c=>S.who[c]&&S.ans[c]>=0).length,t=CHARS.filter(c=>S.who[c]).length;
 if(all){const p=RM?1:.75+.25*Math.sin(V.t*5);ctx.globalAlpha=p;txt('✅ Tout le monde a voté ! Clique sur « Afficher la réponse »',x+w/2,y,17,'#2f9a52','center',UI,false);ctx.globalAlpha=1;}
 else txt(n+' / '+t+' ont voté · on attend les autres…',x+w/2,y,16,'#8a7a66','center',UI,false);}
function drawPresPanel(S){const {x,y,w,h}=PANEL;
 if(S.ph==='pick'){rrect(x,y,w,h,16,'rgba(20,33,61,.94)','#3b5084',2);const t=S.turn>=0?HEROES[S.turn]:null;
  if(t){drawChar(ctx,x+52,y+92,t.look,'down',V.t,false,1.15);txt('À '+t.name+' ('+S.who[S.turn]+') de retourner une carte',x+w/2+20,y+58,28,t.color,'center',UI,false);}
  presTimer(S,x+w-20,y+36);
  const mw=30,mh=44,gap=5,tot=NCARDS*(mw+gap)-gap,sx=x+(w-tot)/2,sy=y+112;
  for(let i=0;i<NCARDS;i++){const mx=sx+i*(mw+gap);if(S.fl[i]){const isA=S.deck[i][0]>=100;rrect(mx,sy,mw,mh,5,isA?'#3a2c5a':'#1d2a52','#5b6a95',1);}
   else{rrect(mx,sy,mw,mh,5,'#E8832A','#fff3dc',1.5);txt('?',mx+mw/2,sy+mh/2+6,14,'#fff3dc','center',PX,false);}}
  txt(S.fl.filter(f=>!f).length+' cartes restantes',x+w/2,sy+mh+18,14,'#aab6d3','center',UI,false);}
 else if(S.ph==='q'||S.ph==='rev'){const v=qView(S.deck[S.cur]),rev=S.ph==='rev';
  rrect(x,y+5,w,h,16,'rgba(0,0,0,.4)');rrect(x,y,w,h,16,'#FDF3E3','#E8832A',4);
  txt('QUESTION '+S.nq+' / '+NQ,x+20,y+30,13,'#c0601a','left',PX,false);
  if(!rev){if(S.dur){txt(answeredTxt(S),x+w-110,y+30,17,'#6b5a45','right',UI,false);presTimer(S,x+w-20,y+32,'#6b5a45');presBar(S,x+20,y+h-14,w-40);}else{voteChips(S,x+w-12,y+30);voteLine(S,y+h-10);}}
  else txt('Bonne réponse : '+'ABC'[v.ok],x+w-20,y+30,17,'#2f9a52','right',UI,false);
  const ql=wrapF(v.q,w-40,F(900,24)).slice(0,2);lines(ql,x+w/2,y+64,28,F(900,24),'#2b1a0a');
  const y0=y+(ql.length>1?102:80);presAnswers(S,y0,[0,1,2].map(i=>['ABC'[i],v.ans[i]]),['#E8832A','#3E86D4','#3FAE5A'],v.ok,rev,56);
  if(rev){const l=wrapF('💡 '+v.why,w-40,F(700,15))[0];txt(l,x+w/2,y0+56+20,15,'#6b5a45','center',UI,false);}}
 else if(S.ph==='act'){const A=ACTIONS[S.act==null?0:S.act];rrect(x,y+5,w,h,16,'rgba(0,0,0,.4)');rrect(x,y,w,h,16,'#3a2c5a','#ffd23f',4);
  txt('CARTE ACTION',x+w/2,y+32,13,'#ffd23f','center',PX,false);txt(A.ico,x+90,y+120,64,'#fff','center',UI,false);
  txt(A.t,x+w/2+40,y+82,30,'#fff','center',UI,false);txt(A.d,x+w/2+40,y+120,20,'#ffe27a','center',UI,false);
  if(S.turn>=0)txt('Carte retournée par '+HEROES[S.turn].name+' ('+S.who[S.turn]+')',x+w/2+40,y+156,16,HEROES[S.turn].color,'center',UI,false);}
 else if(S.ph==='r2q'||S.ph==='r2rev'){const s=SITUATIONS[S.sit[S.si]],rev=S.ph==='r2rev';
  rrect(x,y+5,w,h,16,'rgba(0,0,0,.4)');rrect(x,y,w,h,16,'#FDF3E3','#E8832A',4);
  txt('MANCHE 2 · INFO '+(S.si+1)+' / '+NSIT,x+20,y+30,13,'#c0601a','left',PX,false);
  if(!rev){if(S.dur){txt(answeredTxt(S),x+w-110,y+30,17,'#6b5a45','right',UI,false);presTimer(S,x+w-20,y+32,'#6b5a45');presBar(S,x+20,y+h-14,w-40);}else{voteChips(S,x+w-12,y+30);voteLine(S,y+h-10);}}
  txt(rev?wrapF('💡 '+s[3],w-40,F(700,16))[0]:'📱 Source : '+s[1],x+w/2,y+54,16,rev?'#2f9a52':'#6b5a45','center',UI,false);
  const ls=wrapF(s[0],w-40,F(900,22)).slice(0,2);lines(ls,x+w/2,y+84,26,F(900,22),'#2b1a0a');
  presAnswers(S,y+(ls.length>1?114:100),BINS.map(B=>[B.ico,B.name+' · '+B.sub]),BINS.map(B=>B.col),s[2],rev,50);}
 else if(S.ph==='end'){const j=CHARS.filter(c=>S.who[c]).sort((a,b)=>S.sc[b]-S.sc[a]);rrect(x,y,w,h,16,'#14213D','#ffd23f',4);
  txt('🏆 LA PLUS GRANDE TOUR',x+w/2,y+36,18,'#ffd23f','center',PX);
  if(j.length){const wn=j[0];drawChar(ctx,x+70,y+h-16+(RM?0:Math.sin(V.t*5)*-4),HEROES[wn].look,'down',V.t,false,1.5);txt(HEROES[wn].name+' ('+S.who[wn]+') gagne avec '+S.sc[wn]+' points !',x+w/2+30,y+86,30,HEROES[wn].color,'center');
   txt(j.slice(1).map((c,i)=>(i+2)+'. '+HEROES[c].name+' · '+S.who[c]+' ('+S.sc[c]+')').join('     '),x+w/2+30,y+130,17,'#e6ecfa','center',UI,false);}
  if(!RM&&Math.random()<.5)burst(Math.random()*W,0,['#ffd23f','#E8832A','#3E86D4','#3FAE5A','#8A4FD0'],2);}}

/* ---------- écran des joueurs ---------- */
function drawQuestion(S,meCh){const v=qView(S.deck[S.cur]);let [x,y,w,h,back]=flipRect(S,150,64,660,526);if(back){cardBack(x,y,w,h,S.cur,false);return;}
 ctx.fillStyle='rgba(6,10,24,.6)';ctx.fillRect(0,52,W,H-52);rrect(x,y+6,w,h,16,'rgba(0,0,0,.45)');rrect(x,y,w,h,16,'#FDF3E3','#E8832A',4);
 if(w<600)return;
 txt('QUESTION '+S.nq+' / '+NQ,x+w/2,y+36,13,'#c0601a','center',PX,false);
 const ql=wrapF(v.q,w-60,F(900,26)).slice(0,3);lines(ql,x+w/2,y+82,32,F(900,26),'#2b1a0a');
 const by=y+82+ql.length*32+8,bh=76,gap=14;const rev=S.ph==='rev';const myAns=meCh>=0?S.ans[meCh]:-1;
 for(let i=0;i<3;i++){const yy=by+i*(bh+gap),ok=i===v.ok;let fill='#ffffff',stroke='#d8c28f',tc='#2b1a0a';
  if(!rev&&myAns===i){fill='#ffe8c8';stroke='#E8832A';}
  if(rev){if(ok){fill='#c9f1d5';stroke='#2f9a52';}else if(myAns===i){fill='#f7cfc8';stroke='#c0453a';}}
  rrect(x+26,yy,w-52,bh,12,fill,stroke,3);rrect(x+38,yy+bh/2-21,42,42,21,['#E8832A','#3E86D4','#3FAE5A'][i]);txt('ABC'[i],x+59,yy+bh/2+9,17,'#fff','center',PX,false);
  const al=wrapF(v.ans[i],w-250,F(800,19)).slice(0,2);lines(al,x+96,yy+(al.length>1?bh/2-4:bh/2+7),23,F(800,19),tc,'left');
  if(rev){const who=CHARS.filter(c=>S.ans[c]===i);who.forEach((c,k)=>{drawChar(ctx,x+w-50-k*26,yy+bh-8,HEROES[c].look,'down',V.t,false,.66);});if(ok)txt('✓',x+w-50-who.length*26,yy+bh/2+9,26,'#2f9a52','center',UI,false);}
  if(!rev&&meCh>=0&&S.ans[meCh]<0&&S.who[meCh])hit(x+26,yy,w-52,bh,()=>sendAct('an',i),'a'+i);}
 if(!rev){if(S.dur){const rem=Math.max(0,Math.ceil(S.dur-S.pt));const a=S.pt/S.dur;rrect(x+26,y+h-28,w-52,12,6,'#e8dcc4');rrect(x+26,y+h-28,Math.max(12,(w-52)*(1-a)),12,6,rem<=5?'#c0453a':'#E8832A');
   txt(answeredTxt(S)+' · '+rem+' s',x+w/2,y+h-38,15,'#6b5a45','center',UI,false);}
  else txt(answeredTxt(S),x+w/2,y+h-26,15,'#6b5a45','center',UI,false);
  if(meCh>=0&&S.ans[meCh]>=0)txt(S.dur?'Réponse envoyée ! Attends les autres…':'Réponse envoyée ! Le présentateur va afficher la réponse.',x+w/2,by-10,15,'#c0601a','center',UI,false);}
 else{const won=meCh>=0&&S.gain[meCh]>0;txt(meCh<0?'':(won?'Bravo ! +'+S.gain[meCh]+' points':(myAns<0?'Trop tard !':'Raté !')),x+w/2,by-10,17,won?'#2f9a52':'#c0453a','center',UI,false);
  lines(wrapF('💡 '+v.why,w-60,F(700,15)).slice(0,2),x+w/2,y+h-36,19,F(700,15),'#6b5a45');}}
function drawAction(S,meCh){const A=ACTIONS[S.act==null?0:S.act];let [x,y,w,h,back]=flipRect(S,270,110,420,380);if(back){cardBack(x,y,w,h,S.cur,false);return;}
 ctx.fillStyle='rgba(6,10,24,.6)';ctx.fillRect(0,52,W,H-52);rrect(x,y+6,w,h,16,'rgba(0,0,0,.45)');rrect(x,y,w,h,16,'#3a2c5a','#ffd23f',4);
 if(w<380)return;
 txt('CARTE ACTION',x+w/2,y+38,14,'#ffd23f','center',PX,false);txt(A.ico,x+w/2,y+132,70,'#fff','center',UI,false);
 lines(wrapF(A.t,w-40,F(900,26)),x+w/2,y+196,30,F(900,26),'#fff');lines(wrapF(A.d,w-40,F(700,18)),x+w/2,y+258,23,F(700,18),'#ffe27a');
 if(meCh>=0&&S.gain[meCh])txt((S.gain[meCh]>0?'+':'')+S.gain[meCh]+' points pour toi',x+w/2,y+h-50,18,S.gain[meCh]>0?'#9fe0b0':'#ff9b8a','center',UI,false);
 txt('Carte de '+HEROES[S.turn].name,x+w/2,y+h-20,15,HEROES[S.turn].color,'center',UI,false);}
function drawTop(S,meCh){ctx.fillStyle='#0b1430';ctx.fillRect(0,0,W,52);
 if(meCh>=0){const h=HEROES[meCh];drawChar(ctx,26,47,h.look,'down',V.t,false,.55);txt(h.name+' · '+S.sc[meCh]+' pts',48,33,13,h.color,'left',PX,false);}
 let msg='';if(S.ph==='pick'){msg=S.turn===meCh?'À toi ! Choisis une carte':'C’est à '+HEROES[S.turn].name+' ('+S.who[S.turn]+') de choisir';}else if(S.ph==='q')msg='Tout le monde répond !';else if(S.ph==='rev')msg='Réponse';else if(S.ph==='act')msg='Carte action';else if(S.ph==='end')msg='Fin de la partie';else if(S.ph==='r2q')msg='Alerter, saisir ou poubelle ?';else if(S.ph==='r2rev')msg='Réponse';
 txt(msg,W/2+(meCh>=0?60:40),33,17,S.ph==='pick'&&S.turn===meCh?'#ffd23f':'#fff','center',UI,false);
 if(S.ph==='pick'&&!PRES&&S.dur){const rem=Math.max(0,Math.ceil(S.dur-S.pt));txt(rem+' s',W-16,33,14,rem<=5?'#ff7b6b':'#cfd8ec','right',PX,false);}
 const left=S.fl.filter(x=>!x).length;txt(S.ph.startsWith('r2')||S.ph==='end'?'Manche 2':'Manche 1 · '+left+' cartes',W-16,48,10,'#7f8cae','right',UI,false);}
function drawEnd(S){ctx.fillStyle='rgba(6,10,24,.7)';ctx.fillRect(0,52,W,H-52);const j=CHARS.filter(c=>S.who[c]).sort((a,b)=>S.sc[b]-S.sc[a]);const cx=W/2;
 rrect(cx-260,90,520,460,18,'#14213D','#ffd23f',4);txt('🏆 LA PLUS GRANDE TOUR',cx,140,16,'#ffd23f','center',PX);
 if(j.length){const w=j[0];drawChar(ctx,cx,290+(RM?0:Math.sin(V.t*5)*-6),HEROES[w].look,'down',V.t,false,1.7);txt(HEROES[w].name+' ('+S.who[w]+') gagne !',cx,335,24,HEROES[w].color,'center');}
 j.forEach((c,i)=>{txt((i+1)+'. '+HEROES[c].name+' · '+S.who[c],cx-200,388+i*34,18,HEROES[c].color,'left',UI,false);txt(S.sc[c]+' pts',cx+200,388+i*34,18,'#fff','right',UI,false);});
 if(!RM&&Math.random()<.5)burst(Math.random()*W,0,['#ffd23f','#E8832A','#3E86D4','#3FAE5A','#8A4FD0'],2);}
/* ---------- « À toi ! » : bandeau animé à chaque nouveau tour + cadre qui clignote ---------- */
function bigTxt(s,x,y,f){ctx.font=f;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.lineWidth=6;ctx.strokeStyle='rgba(8,14,32,.85)';ctx.strokeText(s,x,y);ctx.fillStyle='#fff';ctx.fillText(s,x,y);}
function drawTurn(S,meCh){if(S.ph!=='pick'||S.turn<0)return;const mine=S.turn===meCh,h=HEROES[S.turn];
 if(mine){ctx.save();ctx.globalAlpha=.6+.4*Math.sin(V.t*6);ctx.strokeStyle='#ffd23f';ctx.lineWidth=10;ctx.strokeRect(4,56,W-8,H-60);ctx.restore();}
 const A=V.turnAnim;if(!A||A.c!==S.turn||A.t>2.3)return;
 const t=A.t,inn=Math.min(1,t/.3),out=t>1.9?Math.max(0,1-(t-1.9)/.4):1,al=inn*out,e=1-Math.pow(1-inn,3);
 ctx.save();ctx.globalAlpha=al*.65;ctx.fillStyle='#050914';ctx.fillRect(0,52,W,H-52);ctx.globalAlpha=al;
 const bh=170,by=H/2-bh/2+20;ctx.fillStyle=h.color;ctx.fillRect(0,by,W,bh);
 ctx.fillStyle='rgba(255,255,255,.13)';for(let k=-2;k<26;k++)ctx.fillRect(k*44+((t*120)%44),by,18,bh);
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,by+bh-10,W,10);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,by,W,4);
 const pulse=mine&&!RM?1+.06*Math.sin(t*12):1;
 drawChar(ctx,-90+e*250,by+bh-16,h.look,'down',V.t,false,2.3);
 ctx.save();ctx.translate(W/2+80,by+86);ctx.scale(pulse,pulse);bigTxt(mine?'À toi !':'Au tour de '+h.name,0,0,F(900,mine?78:54));ctx.restore();
 bigTxt(mine?'Choisis une carte'+(S.dur?' ('+DUR.pick+' s)':''):String(S.who[S.turn])+' choisit une carte',W/2+80,by+134,F(800,24));
 ctx.restore();}
function render(S,meCh){HITS=[];HOX=0;PRES=meCh<0;V.t+=1/60;ctx.save();if(V.shake>0&&!RM)ctx.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
 drawBg();const r2=S.ph==='r2q'||S.ph==='r2rev';
 if(PRES){drawTowers(S);drawPresPanel(S);}
 else{if(!r2&&S.ph!=='end')drawGrid(S,S.turn===meCh&&meCh>=0);
  if(r2)drawSit(S,meCh);else if(S.ph==='q'||S.ph==='rev')drawQuestion(S,meCh);else if(S.ph==='act')drawAction(S,meCh);else if(S.ph==='end')drawEnd(S);}
 for(const p of V.parts){ctx.globalAlpha=Math.max(0,1-p.t/p.ttl);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.z,p.z);}ctx.globalAlpha=1;
 for(const p of V.pops){ctx.globalAlpha=Math.max(0,1-p.t/1.6);txt(p.s,p.x,p.y-p.t*40,p.big?26:18,p.c,'center',PX);}ctx.globalAlpha=1;
 drawTurn(S,meCh);
 ctx.restore();drawTop(S,meCh);}
function tickV(dt){if(V.flip)V.flip.t+=dt;if(V.turnAnim)V.turnAnim.t+=dt;V.shake=Math.max(0,V.shake-dt);for(const p of V.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;}V.parts=V.parts.filter(p=>p.t<p.ttl);for(const p of V.pops)p.t+=dt;V.pops=V.pops.filter(p=>p.t<1.6);}
/* points gagnés : au-dessus des tours (présentateur) ou en haut de l'écran (joueur) */
function showGains(S,meCh,good){for(let c=0;c<4;c++){const g=S.gain[c];if(!g)continue;
 if(meCh<0){const x=towerCX(c),y=Math.max(towerTop(c)-80,PANEL.y+PANEL.h+95);V.pops.push({x,y,s:(g>0?'+':'')+g,c:g>0?'#ffe27a':'#ff9b8a',t:0,big:1});if(g>0)burst(x,towerTop(c)-30,[HEROES[c].color,'#ffd23f','#fff'],26);}
 else if(c===meCh){V.pops.push({x:W/2,y:120,s:(g>0?'+':'')+g+' pts',c:g>0?'#ffe27a':'#ff9b8a',t:0,big:1});if(g>0)burst(W/2,110,[HEROES[c].color,'#ffd23f','#fff'],26);}}}
/* effets quand l'état change */
function onNewState(S,prev,meCh){if(!prev||prev.en===S.en)return;
 if((S.ph==='q'||S.ph==='act')&&prev.ph==='pick'){V.flip={k:S.en,t:0};sfx(520,.12,'square',.05,300);}
 if(S.ph==='q'&&prev.ph==='q'&&S.en!==prev.en){V.flip=V.flip&&V.flip.k===prev.en?{k:S.en,t:V.flip.t}:V.flip;}
 if(S.ph==='rev'&&prev.ph!=='rev'){if(meCh>=0&&S.gain[meCh]>0){sWin();}else if(meCh>=0&&S.ans[meCh]>=0)sBad();else sfx(660,.2,'square',.04);showGains(S,meCh);}
 if(S.ph==='act'&&prev.ph!=='act'){const k=S.act;const neg=ACTIONS[k]&&ACTIONS[k].v<0;if(neg){V.shake=.35;sBad();}else sWin();showGains(S,meCh);}
 if(S.ph==='r2q'&&(prev.ph!=='r2q'||prev.si!==S.si)){V.flip={k:S.en,t:0};sfx(880,.08,'square',.05);setTimeout(()=>sfx(1175,.08,'square',.04),90);}
 if(S.ph==='r2q'&&prev.ph==='r2q'&&prev.si===S.si&&V.flip&&V.flip.k===prev.en)V.flip.k=S.en;
 if(S.ph==='r2rev'&&prev.ph!=='r2rev'){if(meCh>=0&&S.gain[meCh]>0)sWin();else if(meCh>=0)sBad();else sfx(660,.2,'square',.04);showGains(S,meCh);}
 if(S.ph==='pick'&&(prev.ph!=='pick'||prev.turn!==S.turn)){V.turnAnim={t:0,c:S.turn};
  if(S.turn===meCh)[660,880,1320].forEach((f,i)=>setTimeout(()=>sfx(f,.12,'square',.06),i*110));else sfx(523,.08,'square',.03);}
 if(S.ph==='end'&&prev.ph!=='end')sWin();}
/* ---------- manche 2 : le grand tri (écran joueur, centré) ---------- */
function binRect(i){return [30+i*177,284,160,190];}
function drawSit(S,meCh){const s=SITUATIONS[S.sit[S.si]];const rev=S.ph==='r2rev';const myAns=meCh>=0?S.ans[meCh]:-1;
 ctx.fillStyle='rgba(8,14,32,.35)';ctx.fillRect(0,52,W,H-52);
 HOX=195;ctx.save();ctx.translate(HOX,0);
 txt('MANCHE 2 · LE GRAND TRI',30,82,12,'#F6B26B','left',PX,false);txt('Info '+(S.si+1)+' / '+NSIT,540,82,13,'#cfd8ec','right',UI,false);
 /* la notification */
 const f=V.flip&&V.flip.k===S.en&&!rev?Math.min(1,V.flip.t/.35):1;let cy=100-(1-f)*(1-f)*160;let cx=40,cw=490,ch=168;
 rrect(cx,cy+5,cw,ch,16,'rgba(0,0,0,.4)');rrect(cx,cy,cw,ch,16,'#FDF3E3','#E8832A',3);
 if(cw>200){rrect(cx,cy,cw,34,16,'#E8832A');ctx.fillStyle='#E8832A';ctx.fillRect(cx,cy+18,cw,16);txt('📱 Nouvelle info · Source : '+s[1],cx+16,cy+23,14,'#fff','left',UI,false);
  const ls=wrapF(s[0],cw-40,F(900,21));lines(ls.slice(0,3),cx+cw/2,cy+76+(3-Math.min(3,ls.length))*12,27,F(900,21),'#2b1a0a');}
 if(rev){const B=BINS[s[2]];const k=Math.min(1,S.pt/.25);ctx.save();ctx.translate(cx+cw-80,cy+ch-34);ctx.rotate(-.12);ctx.scale(1.6-.6*k,1.6-.6*k);ctx.globalAlpha=k;rrect(-70,-20,140,40,8,B.col,'#fff',3);txt(B.ico+' '+B.name,0,7,17,'#fff','center',UI,false);ctx.restore();}
 ctx.globalAlpha=1;
 /* les 3 bacs */
 const ok=s[2];
 for(let i=0;i<3;i++){const B=BINS[i];let [x,y,w,h]=binRect(i);const good=rev&&i===ok;const bounce=good&&!RM?-Math.abs(Math.sin(S.pt*6))*8:0;y+=bounce;
  const mine=myAns===i;rrect(x,y+5,w,h,16,'rgba(0,0,0,.4)');rrect(x,y,w,h,16,rev&&!good?'#26324f':B.col,good?'#ffd23f':(mine?'#fff':'rgba(255,255,255,.35)'),good?5:(mine?4:2));
  txt(B.ico,x+w/2,y+62,46,'#fff','center',UI,false);txt(B.name,x+w/2,y+100,21,'#fff','center',UI,false);txt(B.sub,x+w/2,y+122,14,'rgba(255,255,255,.88)','center',UI,false);
  txt(String(i+1),x+16,y+24,12,'rgba(255,255,255,.7)','left',PX,false);
  if(!rev&&mine)txt('Ta réponse',x+w/2,y+150,13,'#fff','center',UI,false);
  if(rev){const who=CHARS.filter(c=>S.who[c]&&S.ans[c]===i);who.forEach((c,k)=>drawChar(ctx,x+20+k*36,y+h-6,HEROES[c].look,'down',V.t,false,.8));}
  if(!rev&&meCh>=0&&S.who[meCh]&&S.ans[meCh]<0)hit(x,y,w,h,()=>sendAct('an',i),'b'+i);}
 if(!rev){const rem=S.dur?Math.max(0,Math.ceil(S.dur-S.pt)):0;if(S.dur){const a=S.pt/S.dur;rrect(30,492,514,12,6,'#26324f');rrect(30,492,Math.max(12,514*(1-a)),12,6,rem<=4?'#c0453a':'#E8832A');}
  txt(meCh>=0&&myAns>=0?'Réponse envoyée ! '+answeredTxt(S):'Clique sur un bac (ou touche 1, 2, 3)'+(S.dur?' · '+rem+' s':''),287,532,15,'#e6ecfa','center',UI,false);}
 else{const won=meCh>=0&&S.gain[meCh]>0;rrect(30,488,514,96,12,'rgba(20,33,61,.95)',won?'#9fe0b0':'#3b5084',2);
  txt((meCh<0?'':(won?'Bravo ! +'+S.gain[meCh]+' points · ':(myAns<0?'Trop tard ! · ':'Raté ! · ')))+BINS[ok].ico+' '+BINS[ok].name,287,514,17,won?'#9fe0b0':(meCh<0?'#ffe27a':'#ff9b8a'),'center',UI,false);
  lines(wrapF(s[3],480,F(700,14)).slice(0,3),287,540,18,F(700,14),'#e6ecfa');}
 ctx.restore();HOX=0;}
