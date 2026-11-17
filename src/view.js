/* ---------- rendu du jeu (même écran pour tous) ---------- */
const W=960,H=600,GX=22,GY=70,CWd=82,CHd=112,GAPX=9,GAPY=10,GROUND=560;
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const V={t:0,th:[0,0,0,0],hover:-1,flip:null,lastKey:'',parts:[],pops:[],shake:0};
let HITS=[];
function hit(x,y,w,h,fn,id){HITS.push({x,y,w,h,fn,id});}
function cardXY(i){const c=i%6,r=Math.floor(i/6);return [GX+c*(CWd+GAPX),GY+r*(CHd+GAPY)];}
function wrapF(s,maxW,f){ctx.font=f;const ws=String(s).split(' ');const out=[];let cur='';for(const w of ws){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){out.push(cur);cur=w;}else cur=t;}if(cur)out.push(cur);return out;}
function lines(ls,x,y,lh,f,col,al){ctx.font=f;ctx.fillStyle=col;ctx.textAlign=al||'center';ls.forEach((l,i)=>ctx.fillText(l,x,y+i*lh));}
function F(w,s){return w+' '+s+'px '+UI;}
function burst(x,y,cols,n){if(RM)n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=Math.random()*6.283,s=60+Math.random()*220;V.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-90,t:0,ttl:.7+Math.random()*.6,c:cols[i%cols.length],z:3+Math.random()*4});}}
function drawBg(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#16244a');g.addColorStop(.75,'#2a2140');g.addColorStop(1,'#3a2a2a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<50;i++){ctx.globalAlpha=.2+.3*Math.abs(Math.sin(V.t*.7+i));ctx.fillRect((i*97)%W,(i*53)%330,2,2);}ctx.globalAlpha=1;
 ctx.fillStyle='#4a3424';ctx.fillRect(570,GROUND,W-570,H-GROUND);ctx.fillStyle='#5f4530';ctx.fillRect(570,GROUND,W-570,6);ctx.fillStyle='#3a8a3a';ctx.fillRect(570,GROUND-4,W-570,5);}
function cardBack(x,y,w,h,i,hl){rrect(x,y+4,w,h,10,'rgba(0,0,0,.4)');rrect(x,y,w,h,10,hl?'#F6B26B':'#E8832A','#fff3dc',2);
 ctx.save();ctx.beginPath();ctx.rect(x+6,y+6,w-12,h-12);ctx.clip();ctx.fillStyle='rgba(255,255,255,.14)';for(let k=-4;k<10;k++){ctx.fillRect(x+k*16,y,7,h);}ctx.restore();
 rrect(x+w/2-20,y+h/2-22,40,44,20,'#fff3dc');txt('?',x+w/2,y+h/2+11,24,'#c0601a','center',PX,false);txt(String(i+1),x+10,y+18,10,'#fff3dc','left',PX,false);}
function cardFace(x,y,w,h,card){const isA=card[0]>=100;rrect(x,y,w,h,10,isA?'#3a2c5a':'#1d2a52','#5b6a95',2);ctx.globalAlpha=.85;
 if(isA){const A=ACTIONS[card[0]-100];txt(A.ico,x+w/2,y+h/2+4,30,'#fff','center',UI,false);}else{txt('✓',x+w/2,y+h/2+10,30,'#5b6a95','center',UI,false);}ctx.globalAlpha=1;}
function drawGrid(S,mine){for(let i=0;i<NCARDS;i++){const [x,y]=cardXY(i);
 if(S.fl[i]){cardFace(x,y,CWd,CHd,S.deck[i]);continue;}
 const can=mine&&S.ph==='pick';const hl=can&&V.hover===i;cardBack(x,y-(hl?6:0),CWd,CHd,i,hl);
 if(can)hit(x,y,CWd,CHd,()=>sendAct('pk',i),i);}}
function drawTowers(S){const j=CHARS.filter(c=>S.who[c]);const mx=Math.max(800,...S.sc.map(s=>s+100));let lead=-1;j.forEach(c=>{if(lead<0||S.sc[c]>S.sc[lead])lead=c;});if(S.sc[lead]===0)lead=-1;
 for(let c=0;c<4;c++){const x0=584+c*92,on=!!S.who[c],h=HEROES[c];const target=on?Math.max(10,S.sc[c]/mx*420):0;V.th[c]+=(target-V.th[c])*Math.min(1,.06*(RM?10:1));
  const th=V.th[c],tx=x0+34,tw=50;
  if(on){for(let y=GROUND-6,k=0;y>GROUND-6-th;y-=18,k++){const bh=Math.min(18,y-(GROUND-6-th));ctx.fillStyle=k%2?'#c97a2b':'#e0913a';ctx.fillRect(tx,y-bh,tw,bh);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(tx,y-2,tw,2);ctx.fillRect(tx+(k%2?24:12),y-bh,2,bh);}
   ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.strokeRect(tx,GROUND-6-th,tw,th);
   const top=GROUND-6-th;ctx.fillStyle='#e6ecfa';ctx.fillRect(tx+tw/2-1,top-26,2,26);ctx.fillStyle=h.color;ctx.beginPath();ctx.moveTo(tx+tw/2+1,top-26);ctx.lineTo(tx+tw/2+22,top-20);ctx.lineTo(tx+tw/2+1,top-14);ctx.fill();
   txt(String(S.sc[c]),tx+tw/2,top-34,13,'#fff','center',PX);if(c===lead)txt('👑',tx+tw/2,top-52,20,'#ffd23f','center',UI,false);}
  const turn=S.turn===c&&['pick','q','rev','act'].includes(S.ph);const bob=turn&&!RM?Math.sin(V.t*6)*-3:0;
  ctx.globalAlpha=on?1:.25;drawChar(ctx,x0+18,GROUND+bob,h.look,'down',V.t,false,1.05);ctx.globalAlpha=1;
  if(turn){ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(x0+12,GROUND-74);ctx.lineTo(x0+24,GROUND-74);ctx.lineTo(x0+18,GROUND-66);ctx.fill();}
  txt(h.name,x0+44,GROUND+18,13,h.color,'center',UI,false);txt(on?String(S.who[c]).slice(0,12):'libre',x0+44,GROUND+34,11,on?'#e6ecfa':'#7f8cae','center',UI,false);}}
function bigCardRect(){return [52,84,480,450];}
function drawQuestion(S,meCh){const v=qView(S.deck[S.cur]);let [x,y,w,h]=bigCardRect();
 const f=V.flip&&V.flip.k===S.en?Math.min(1,V.flip.t/.45):1;if(f<1){const [cx,cy]=cardXY(S.cur);const e=1-Math.pow(1-f,3);x=cx+(x-cx)*e;y=cy+(y-cy)*e;w=CWd+(w-CWd)*e;h=CHd+(h-CHd)*e;if(f<.5){cardBack(x,y,w,h,S.cur,false);return;}}
 ctx.fillStyle='rgba(6,10,24,.55)';ctx.fillRect(0,52,570,H-52);rrect(x,y+6,w,h,16,'rgba(0,0,0,.45)');rrect(x,y,w,h,16,'#FDF3E3','#E8832A',4);
 txt('QUESTION '+S.nq+' / '+NQ,x+w/2,y+32,11,'#c0601a','center',PX,false);
 const ql=wrapF(v.q,w-50,F(900,21));lines(ql,x+w/2,y+70,27,F(900,21),'#2b1a0a');
 const by=y+70+ql.length*27+12,bh=62,gap=12;const rev=S.ph==='rev';const myAns=meCh>=0?S.ans[meCh]:-1;
 for(let i=0;i<3;i++){const yy=by+i*(bh+gap),ok=i===v.ok;let fill='#ffffff',stroke='#d8c28f',tc='#2b1a0a';
  if(!rev&&myAns===i){fill='#ffe8c8';stroke='#E8832A';}
  if(rev){if(ok){fill='#c9f1d5';stroke='#2f9a52';}else if(myAns===i){fill='#f7cfc8';stroke='#c0453a';}}
  rrect(x+22,yy,w-44,bh,12,fill,stroke,3);rrect(x+32,yy+13,36,36,18,['#E8832A','#3E86D4','#3FAE5A'][i]);txt('ABC'[i],x+50,yy+38,15,'#fff','center',PX,false);
  const al=wrapF(v.ans[i],w-215,F(800,16));lines(al.slice(0,2),x+82,yy+(al.length>1?27:37),19,F(800,16),tc,'left');
  if(rev){const who=CHARS.filter(c=>S.ans[c]===i);who.forEach((c,k)=>{drawChar(ctx,x+w-40-k*24,yy+bh-6,HEROES[c].look,'down',V.t,false,.62);});if(ok)txt('✓',x+w-40-who.length*24,yy+40,22,'#2f9a52','center',UI,false);}
  if(!rev&&meCh>=0&&S.ans[meCh]<0&&S.who[meCh])hit(x+22,yy,w-44,bh,()=>sendAct('an',i),'a'+i);}
 if(!rev){const rem=Math.max(0,Math.ceil(S.dur-S.pt));const a=S.pt/S.dur;rrect(x+22,y+h-30,w-44,12,6,'#e8dcc4');rrect(x+22,y+h-30,Math.max(12,(w-44)*(1-a)),12,6,rem<=5?'#c0453a':'#E8832A');
  const answered=CHARS.filter(c=>S.who[c]&&S.ans[c]>=0).length,tot=CHARS.filter(c=>S.who[c]).length;txt(answered+' / '+tot+' ont répondu · '+rem+' s',x+w/2,y+h-40,13,'#6b5a45','center',UI,false);
  if(meCh>=0&&S.ans[meCh]>=0)txt('Réponse envoyée ! Attends les autres…',x+w/2,by-8,13,'#c0601a','center',UI,false);}
 else{lines(wrapF('💡 '+v.why,w-50,F(700,14)),x+w/2,y+h-36,18,F(700,14),'#6b5a45');}}
function drawAction(S){const A=ACTIONS[S.act==null?0:S.act];let [x,y,w,h]=[110,150,360,300];
 const f=V.flip&&V.flip.k===S.en?Math.min(1,V.flip.t/.45):1;if(f<1){const [cx,cy]=cardXY(S.cur);const e=1-Math.pow(1-f,3);x=cx+(x-cx)*e;y=cy+(y-cy)*e;w=CWd+(w-CWd)*e;h=CHd+(h-CHd)*e;if(f<.5){cardBack(x,y,w,h,S.cur,false);return;}}
 ctx.fillStyle='rgba(6,10,24,.55)';ctx.fillRect(0,52,570,H-52);rrect(x,y+6,w,h,16,'rgba(0,0,0,.45)');rrect(x,y,w,h,16,'#3a2c5a','#ffd23f',4);
 txt('CARTE ACTION',x+w/2,y+34,12,'#ffd23f','center',PX,false);txt(A.ico,x+w/2,y+110,56,'#fff','center',UI,false);
 lines(wrapF(A.t,w-40,F(900,22)),x+w/2,y+168,26,F(900,22),'#fff');lines(wrapF(A.d,w-40,F(700,16)),x+w/2,y+222,21,F(700,16),'#ffe27a');
 txt('Carte de '+HEROES[S.turn].name,x+w/2,y+h-18,13,HEROES[S.turn].color,'center',UI,false);}
function drawTop(S,meCh){ctx.fillStyle='#0b1430';ctx.fillRect(0,0,W,52);if(meCh>=0)txt('OPÉRATION ABRICOT',16,32,13,'#F6B26B','left',PX,false);
 let msg='';if(S.ph==='pick'){msg=S.turn===meCh?'À toi ! Choisis une carte':'C’est à '+HEROES[S.turn].name+' ('+S.who[S.turn]+') de choisir';}else if(S.ph==='q')msg='Tout le monde répond !';else if(S.ph==='rev')msg='Réponse';else if(S.ph==='act')msg='Carte action';else if(S.ph==='end')msg='Fin de la partie';else if(S.ph==='r2q')msg='Alerter, saisir ou poubelle ?';else if(S.ph==='r2rev')msg='Réponse';
 txt(msg,W/2+40,33,17,S.ph==='pick'&&S.turn===meCh?'#ffd23f':'#fff','center',UI,false);
 if(S.ph==='pick'){const rem=Math.max(0,Math.ceil(S.dur-S.pt));txt(rem+' s',W-16,33,14,rem<=5?'#ff7b6b':'#cfd8ec','right',PX,false);}
 const left=S.fl.filter(x=>!x).length;txt(S.ph.startsWith('r2')||S.ph==='end'?'Manche 2':'Manche 1 · '+left+' cartes',W-16,48,10,'#7f8cae','right',UI,false);}
function drawEnd(S){ctx.fillStyle='rgba(6,10,24,.7)';ctx.fillRect(0,52,570,H-52);const j=CHARS.filter(c=>S.who[c]).sort((a,b)=>S.sc[b]-S.sc[a]);
 rrect(60,110,460,400,18,'#14213D','#ffd23f',4);txt('🏆 LA PLUS GRANDE TOUR',290,160,16,'#ffd23f','center',PX);
 if(j.length){const w=j[0];drawChar(ctx,290,300+(RM?0:Math.sin(V.t*5)*-6),HEROES[w].look,'down',V.t,false,2.6);txt(HEROES[w].name+' ('+S.who[w]+') gagne !',290,340,22,HEROES[w].color,'center');}
 j.forEach((c,i)=>{txt((i+1)+'. '+HEROES[c].name+' · '+S.who[c],120,385+i*28,16,HEROES[c].color,'left',UI,false);txt(S.sc[c]+' pts',460,385+i*28,16,'#fff','right',UI,false);});
 if(!RM&&Math.random()<.5)burst(Math.random()*W,0,['#ffd23f','#E8832A','#3E86D4','#3FAE5A','#8A4FD0'],2);}
function render(S,meCh){HITS=[];V.t+=1/60;ctx.save();if(V.shake>0&&!RM)ctx.translate((Math.random()-.5)*6,(Math.random()-.5)*6);
 drawBg();const r2=S.ph==='r2q'||S.ph==='r2rev';if(!r2)drawGrid(S,S.turn===meCh&&meCh>=0);drawTowers(S);
 if(r2)drawSit(S,meCh);else if(S.ph==='q'||S.ph==='rev')drawQuestion(S,meCh);else if(S.ph==='act')drawAction(S);else if(S.ph==='end')drawEnd(S);
 for(const p of V.parts){ctx.globalAlpha=Math.max(0,1-p.t/p.ttl);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.z,p.z);}ctx.globalAlpha=1;
 for(const p of V.pops){ctx.globalAlpha=Math.max(0,1-p.t/1.6);txt(p.s,p.x,p.y-p.t*40,16,p.c,'center',PX);}ctx.globalAlpha=1;
 ctx.restore();drawTop(S,meCh);}
function tickV(dt){if(V.flip)V.flip.t+=dt;V.shake=Math.max(0,V.shake-dt);for(const p of V.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;}V.parts=V.parts.filter(p=>p.t<p.ttl);for(const p of V.pops)p.t+=dt;V.pops=V.pops.filter(p=>p.t<1.6);}
/* effets quand l'état change */
function onNewState(S,prev,meCh){if(!prev||prev.en===S.en)return;
 if((S.ph==='q'||S.ph==='act')&&prev.ph==='pick'){V.flip={k:S.en,t:0};sfx(520,.12,'square',.05,300);}
 if(S.ph==='q'&&prev.ph==='q'&&S.en!==prev.en){V.flip=V.flip&&V.flip.k===prev.en?{k:S.en,t:V.flip.t}:V.flip;}
 if(S.ph==='rev'&&prev.ph!=='rev'){const any=S.gain.some(g=>g>0);if(meCh>=0&&S.gain[meCh]>0){sWin();}else if(meCh>=0&&S.ans[meCh]>=0)sBad();else sfx(660,.2,'square',.04);
  for(let c=0;c<4;c++)if(S.gain[c]>0){const x=584+c*92+59;burst(x,GROUND-V.th[c]-30,[HEROES[c].color,'#ffd23f','#fff'],22);V.pops.push({x,y:GROUND-V.th[c]-60,s:'+'+S.gain[c],c:'#ffe27a',t:0});}}
 if(S.ph==='act'&&prev.ph!=='act'){const k=S.act;const neg=ACTIONS[k]&&ACTIONS[k].v<0;if(neg){V.shake=.35;sBad();}else sWin();
  for(let c=0;c<4;c++)if(S.gain[c]){const x=584+c*92+59;V.pops.push({x,y:GROUND-V.th[c]-60,s:(S.gain[c]>0?'+':'')+S.gain[c],c:S.gain[c]>0?'#9fe0b0':'#ff9b8a',t:0});if(S.gain[c]>0)burst(x,GROUND-V.th[c]-30,['#9fe0b0','#fff'],16);}}
 if(S.ph==='r2q'&&(prev.ph!=='r2q'||prev.si!==S.si)){V.flip={k:S.en,t:0};sfx(880,.08,'square',.05);setTimeout(()=>sfx(1175,.08,'square',.04),90);}
 if(S.ph==='r2q'&&prev.ph==='r2q'&&prev.si===S.si&&V.flip&&V.flip.k===prev.en)V.flip.k=S.en;
 if(S.ph==='r2rev'&&prev.ph!=='r2rev'){if(meCh>=0&&S.gain[meCh]>0)sWin();else if(meCh>=0)sBad();else sfx(660,.2,'square',.04);
  for(let c=0;c<4;c++)if(S.gain[c]>0){const x=584+c*92+59;burst(x,GROUND-V.th[c]-30,[HEROES[c].color,'#ffd23f','#fff'],20);V.pops.push({x,y:GROUND-V.th[c]-60,s:'+'+S.gain[c],c:'#ffe27a',t:0});}}
 if(S.ph==='pick'&&prev.ph!=='pick'&&S.turn===meCh)sfx(880,.1,'square',.05);
 if(S.ph==='end'&&prev.ph!=='end')sWin();}
/* ---------- manche 2 : le grand tri ---------- */
function binRect(i){return [30+i*177,284,160,190];}
function drawSit(S,meCh){const s=SITUATIONS[S.sit[S.si]];const rev=S.ph==='r2rev';const myAns=meCh>=0?S.ans[meCh]:-1;
 ctx.fillStyle='rgba(8,14,32,.35)';ctx.fillRect(0,52,570,H-52);
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
  if(rev){const who=CHARS.filter(c=>S.who[c]&&S.ans[c]===i);who.forEach((c,k)=>drawChar(ctx,x+20+k*36,y+h-6,HEROES[c].look,good?'down':'down',V.t,false,.8));}
  if(!rev&&meCh>=0&&S.who[meCh]&&S.ans[meCh]<0)hit(x,y,w,h,()=>sendAct('an',i),'b'+i);}
 if(!rev){const rem=Math.max(0,Math.ceil(S.dur-S.pt));const a=S.pt/S.dur;rrect(30,492,514,12,6,'#26324f');rrect(30,492,Math.max(12,514*(1-a)),12,6,rem<=4?'#c0453a':'#E8832A');
  const answered=CHARS.filter(c=>S.who[c]&&S.ans[c]>=0).length,tot=CHARS.filter(c=>S.who[c]).length;
  txt(meCh>=0&&myAns>=0?'Réponse envoyée ! '+answered+' / '+tot+' ont répondu':'Clique sur un bac (ou touche 1, 2, 3) · '+rem+' s',287,532,15,'#e6ecfa','center',UI,false);}
 else{const won=meCh>=0&&S.gain[meCh]>0;rrect(30,488,514,96,12,'rgba(20,33,61,.95)',won?'#9fe0b0':'#3b5084',2);
  txt((meCh<0?'':(won?'Bravo ! +'+S.gain[meCh]+' points · ':(myAns<0?'Trop tard ! · ':'Raté ! · ')))+BINS[ok].ico+' '+BINS[ok].name,287,514,17,won?'#9fe0b0':(meCh<0?'#ffe27a':'#ff9b8a'),'center',UI,false);
  lines(wrapF(s[3],480,F(700,14)).slice(0,3),287,540,18,F(700,14),'#e6ecfa');}}
