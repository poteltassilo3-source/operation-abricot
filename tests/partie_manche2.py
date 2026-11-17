import asyncio, subprocess, time
from playwright.async_api import async_playwright
BOT="""()=>{if(window.__bot)return;window.__bot=setInterval(()=>{const d=window.__dbg,S=d.ST;if(!S)return;
 if(S.ph==='pick'&&S.turn===d.me.ch&&Math.random()<.4){const f=S.fl.map((x,i)=>x?-1:i).filter(i=>i>=0);d.sendAct('pk',f[0]);}
 if(S.ph==='q'&&S.ans[d.me.ch]<0&&Math.random()<.3){const v=d.qView(S.deck[S.cur]);d.sendAct('an',v.ok);}
 if(S.ph==='r2q'&&S.ans[d.me.ch]<0&&Math.random()<.025){const ok=d.SIT[S.sit[S.si]][2];d.sendAct('an',Math.random()<.75?ok:(ok+1)%3);}
},200);}"""
async def main():
    srv=subprocess.Popen(['python3','-m','http.server','8770'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':1180,'height':760});await c.add_init_script(path='tests/mock_reseau.js')
        errs=[]
        async def page():
            pg=await c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://localhost:8770/index.html');return pg
        P=[]
        for i,nm in enumerate(['Tassilo','Lorenzo','Louis','Sam']):
            pg=await page();await asyncio.sleep(.9);await pg.click('#ch%d'%i);await pg.fill('#pname',nm);await pg.click('#joinBtn');P.append(pg)
        await asyncio.sleep(1.5);await P[0].click('#lbGo');await asyncio.sleep(1)
        for pg in P: await pg.click('#rdBtn');await asyncio.sleep(.3)
        await asyncio.sleep(1)
        await P[0].evaluate("()=>{const S=window.__dbg.GM.S;for(let i=2;i<24;i++)S.fl[i]=1;S.sc=[600,450,300,150];}")
        for pg in P: await pg.evaluate(BOT)
        t0=time.time();shots=set()
        while time.time()-t0<260:
            await asyncio.sleep(.8)
            s=await P[2].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.si,S.sc]}")
            if s[0] not in shots or (s[0]=='r2q' and s[1]==3 and 'q3' not in shots):
                if s[0]=='r2rules':
                    shots.add(s[0]);await asyncio.sleep(1);await P[2].screenshot(path='b_rules2.png')
                    for pg in P: await pg.click('#rd2Btn');await asyncio.sleep(.2)
                elif s[0]=='r2q' and s[1]==3: shots.add('q3');await asyncio.sleep(1.5);await P[2].screenshot(path='b_q.png')
                elif s[0]=='r2rev' and 'r2rev' not in shots and s[1]>=2: shots.add('r2rev');await asyncio.sleep(1.2);await P[2].screenshot(path='b_rev.png')
                elif s[0]=='end': await asyncio.sleep(1.5);await P[1].screenshot(path='b_end.png');print('END',s);break
                else: shots.add(s[0]) if s[0] not in ('r2q','r2rev') else None
            print(round(time.time()-t0),s,flush=True)
        print('errs',errs[:5]);await b.close()
    srv.kill()
asyncio.run(main())
