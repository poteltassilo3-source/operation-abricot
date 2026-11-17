(function(){
 const bc=new BroadcastChannel('mockroom');const peer=Math.random().toString(36).slice(2,10);
 let mine={};const others={};let hs=[];let first=true;
 function snapshot(){const me={peer,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:mine,updatedAt:Date.now()};
  return [me,...Object.values(others)];}
 function notify(){const ps=snapshot();setTimeout(()=>hs.forEach(h=>h({peers:ps,joined:[],left:[],updated:[]})),0);}
 bc.onmessage=e=>{const d=e.data;if(d.t==='p'){others[d.peer]={peer:d.peer,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:JSON.parse(d.p),updatedAt:Date.now()};notify();}
  else if(d.t==='hello'){bc.postMessage({t:'p',peer,p:JSON.stringify(mine)});}
  else if(d.t==='bye'){delete others[d.peer];notify();}};
 window.addEventListener('beforeunload',()=>bc.postMessage({t:'bye',peer}));
 const room={presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k];}mine=JSON.parse(JSON.stringify(mine));bc.postMessage({t:'p',peer,p:JSON.stringify(mine)});notify();return Promise.resolve();},
  onPeers(h){hs.push(h);notify();return ()=>{};},peers:snapshot,emit:()=>Promise.resolve(),on:()=>()=>{},connected:()=>true};
 window.claude={use:async n=>{await new Promise(r=>setTimeout(r,200));bc.postMessage({t:'hello'});return n==='room'?room:null;}};
})();
