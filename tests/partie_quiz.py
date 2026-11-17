import asyncio, subprocess, time, sys
from playwright.async_api import async_playwright
BOT="""()=>{if(window.__bot)return;window.__bot=setInterval(()=>{const d=window.__dbg,S=d.ST;if(!S)return;
 if(S.ph==='pick'&&S.turn===d.me.ch&&Math.random()<.25){const f=S.fl.map((x,i)=>x?-1:i).filter(i=>i>=0);d.sendAct('pk',f[Math.floor(Math.random()*f.length)]);}
 if(S.ph==='q'&&S.ans[d.me.ch]<0&&Math.random()<.12){const v=d.qView(S.deck[S.cur]);d.sendAct('an',Math.random()<.7?v.ok:(v.ok+1)%3);}
},200);}"""
async def main():
    srv=subprocess.Popen(['python3','-m','http.server','8768'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':1180,'height':760});await c.add_init_script(path='tests/mock_reseau.js')
        errs=[]
        async def page():
            pg=await c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);await pg.goto('http://localhost:8768/index.html');return pg
        P=[]
        for i,nm in enumerate(['Tassilo','Lorenzo','Louis','Sam']):
            pg=await page();await asyncio.sleep(.9)
            if i==0: await pg.screenshot(path='a_title.png')
            await pg.click('#ch%d'%i);await pg.fill('#pname',nm);await pg.click('#joinBtn');P.append(pg)
        spec=await page();await asyncio.sleep(.9);await spec.click('#specBtn')
        await asyncio.sleep(1.5);await P[1].screenshot(path='a_lobby.png')
        print('hosts',[await pg.evaluate("()=>window.__dbg.hostMode") for pg in P])
        await P[2].click('#lbGo');await asyncio.sleep(1.2);await P[3].screenshot(path='a_rules.png')
        for pg in P: await pg.click('#rdBtn');await asyncio.sleep(.3)
        await asyncio.sleep(1.5);await P[0].screenshot(path='a_pick.png')
        for pg in P: await pg.evaluate(BOT)
        t0=time.time();shots=set()
        while time.time()-t0<float(sys.argv[1]):
            await asyncio.sleep(1)
            s=await P[1].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.turn,S.nq,S.sc,S.fl.filter(x=>x).length,S.act]}")
            print(round(time.time()-t0),s,flush=True)
            k=s[0]
            if k in('q','rev','act') and k not in shots:
                shots.add(k);await asyncio.sleep(.7 if k!='q' else 1.2);await P[1].screenshot(path='a_%s.png'%k);await spec.screenshot(path='a_spec_%s.png'%k)
            if k=='end':await asyncio.sleep(2);await P[0].screenshot(path='a_end.png');break
        print('errs',errs[:6])
        await b.close()
    srv.kill()
asyncio.run(main())
