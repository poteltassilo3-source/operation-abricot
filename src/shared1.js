const UI='"Nunito","Trebuchet MS",Verdana,sans-serif', PX='"Press Start 2P","Courier New",monospace';
const TEAMS=[{name:'Les Bergeron',color:'#E8832A',letter:'B'},{name:'Les Luizet',color:'#3E86D4',letter:'L'},{name:'Les Polonais',color:'#3FAE5A',letter:'P'}];
const HEROES=[
 {id:'cleo',name:'Cléo',role:'Capteur',color:'#E8832A',look:{skin:'#f1c27d',hair:'#7a3b12',shirt:'#E8832A',pants:'#3e5c9a',x:['scarf','binoc']}},
 {id:'ana',name:'Ana',role:'Analyste',color:'#3E86D4',look:{skin:'#e0ac69',hair:'#1d1d2b',shirt:'#3E86D4',pants:'#2b2f4a',x:['glasses','book']}},
 {id:'remi',name:'Rémi',role:'Relais',color:'#3FAE5A',look:{skin:'#c68642',hair:'#2a1a10',shirt:'#3FAE5A',pants:'#6b4a2b',x:['cap','bag']}},
 {id:'dax',name:'Dax',role:'Décideur',color:'#8A4FD0',look:{skin:'#f1c27d',hair:'#b8860b',shirt:'#8A4FD0',pants:'#33264d',x:['cape','crown']}}
];
const MAMIE={skin:'#f0c9a0',hair:'#f2f2f2',shirt:'#e86f9a',pants:'#e86f9a',skirt:'#b5456e',x:['bun','apron']};
const BARON={skin:'#e8c9a8',hair:'#222',shirt:'#5a1626',pants:'#1a1a1a',x:['tall','mustache','cape2']};
const NPCS=[
 {skin:'#f1c27d',hair:'#4a3020',shirt:'#e0c040',pants:'#44506a',x:['apron']},
 {skin:'#c68642',hair:'#111',shirt:'#c0453a',pants:'#333',x:['cap']},
 {skin:'#e8c9a8',hair:'#c0a050',shirt:'#6fb0d0',pants:'#665544',x:[]},
 {skin:'#8d5524',hair:'#222',shirt:'#9a6ad0',pants:'#2a2a3a',x:['apron']}
];

/* ---------- utilitaires ---------- */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const fmt=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let AC=null;
function sfx(f,d,type,vol,slide){if(window.__mute)return;try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();}
 const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;if(slide)o.frequency.linearRampToValueAtTime(f+slide,AC.currentTime+d);
 g.gain.value=vol||0.04;g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}}
const sGood=()=>{sfx(520,.1,'square',.05);setTimeout(()=>sfx(780,.16,'square',.05),90);};
const sBad=()=>sfx(150,.25,'sawtooth',.05,-60);
const sTick=()=>sfx(660,.04,'square',.025);
const sWin=()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>sfx(f,.2,'square',.05),i*120));};
