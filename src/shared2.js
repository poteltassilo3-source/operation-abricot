/* ---------- personnages pixel art ---------- */
function drawChar(c,x,y,look,face,t,moving,sc){
 sc=sc||1;const u=3*sc;const ex=look.x||[];
 const R=(ax,ay,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+ax*u),Math.round(y+ay*u),Math.ceil(w*u),Math.ceil(h*u));};
 c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y,6*u,2*u,0,0,7);c.fill();
 const ph=moving?Math.floor(t*9)%2:0, bob=moving?0:(Math.floor(t*2)%2?0:0);
 const side=face==='left'||face==='right';
 if(ex.includes('cape')&&face!=='up')R(-5,-11,10,10,'#b8302a');
 if(ex.includes('cape2')&&face!=='up')R(-5,-12,10,12,'#3a0d18');
 if(look.skirt){R(-4,-6,8,6,look.skirt);}else{R(-3.5,-4,3,4-(ph?1:0),look.pants);R(0.5,-4,3,4-(ph?0:1),look.pants);R(-3.5,-1,3,1,'#2a2018');R(0.5,-1,3,1,'#2a2018');}
 R(-4,-10,8,6,look.shirt);
 R(-6,-10,2,5,look.shirt);R(4,-10,2,5,look.shirt);R(-6,-5,2,1.2,look.skin);R(4,-5,2,1.2,look.skin);
 if(ex.includes('scarf'))R(-4,-10,8,2,'#f6d36b');
 if(ex.includes('binoc')&&face==='down'){R(-3,-8,2.5,2.5,'#1c1c1c');R(0.5,-8,2.5,2.5,'#1c1c1c');}
 if(ex.includes('apron')&&face==='down')R(-3,-9,6,6,'#fff');
 if(ex.includes('book')&&face!=='up'){R(4.5,-8,3,4,'#f4f4f4');R(4.5,-8,3,.8,'#3E86D4');}
 if(ex.includes('bag')){R(-6,-8,3,4,'#8b5a2b');R(-4,-10,1,5,'#5a3a1b');}
 R(-4,-17,8,7,look.skin);
 if(face==='up'){R(-4,-18,8,8,look.hair);}
 else{R(-4,-18,8,3,look.hair);
  if(face==='down'){R(-4,-15,1,2,look.hair);R(3,-15,1,2,look.hair);R(-2,-14,1,1.3,'#1a1a1a');R(1,-14,1,1.3,'#1a1a1a');}
  else{const l=face==='left';R(l?0:-4,-18,4,8,look.hair);R(l?-3:2,-14,1,1.3,'#1a1a1a');}}
 if(ex.includes('glasses')&&face!=='up'){R(-3.2,-14.6,3,2.2,'#222');R(0.2,-14.6,3,2.2,'#222');R(-2.7,-14.1,2,1.2,'#cfe8ff');R(0.7,-14.1,2,1.2,'#cfe8ff');}
 if(ex.includes('cap')){R(-4.5,-19.5,9,3.5,'#d03a3a');if(face==='down')R(-4.5,-16.5,9,1,'#a02525');}
 if(ex.includes('crown')){R(-3,-21,6,3,'#f1c40f');R(-3,-22.5,1.4,1.6,'#f1c40f');R(-0.7,-22.5,1.4,1.6,'#f1c40f');R(1.6,-22.5,1.4,1.6,'#f1c40f');}
 if(ex.includes('bun'))R(-2,-21,4,3.5,look.hair);
 if(ex.includes('tall')){R(-4.5,-19,9,2,'#111');R(-3.5,-25,7,6.5,'#111');}
 if(ex.includes('mustache')&&face==='down')R(-3,-12,6,1.2,'#111');
 if(ex.includes('cape')&&face==='up')R(-5,-11,10,10,'#b8302a');
 if(ex.includes('cape2')&&face==='up')R(-5,-12,10,12,'#3a0d18');
}
function txt(s,x,y,size,col,al,font,stroke){ctx.font=size+'px '+(font||UI);ctx.textAlign=al||'left';ctx.textBaseline='alphabetic';
 if(stroke!==false){ctx.lineWidth=3;ctx.lineJoin='round';ctx.strokeStyle='rgba(8,14,32,.92)';ctx.strokeText(s,x,y);}ctx.fillStyle=col||'#fff';ctx.fillText(s,x,y);}
function wrapLines(s,maxW,size,font){ctx.font=size+'px '+(font||UI);const words=String(s).split(' ');const lines=[];let cur='';
 for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);return lines;}
function rrect(x,y,w,h,r,fill,stroke,lw){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=lw||2;ctx.strokeStyle=stroke;ctx.stroke();}}
