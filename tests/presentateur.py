import asyncio, subprocess, time
from playwright.async_api import async_playwright
BOT=open('tests/partie_manche2.py').read().split('BOT="""')[1].split('"""')[0].replace('<.025','<.1')
async def main():
    srv=subprocess.Popen(['python3','-m','http.server','8771'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':1280,'height':800});await c.add_init_script(path='tests/mock_reseau.js')
        errs=[]
        async def page(h=''):
            pg=await c.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto('http://localhost:8771/index.html'+h);return pg
        P=[]
        for i,nm in enumerate(['Lorenzo','Louis','Sam']):
            pg=await page();await asyncio.sleep(.9);await pg.click('#ch%d'%(i+1));await pg.fill('#pname',nm);await pg.click('#joinBtn');P.append(pg)
        await asyncio.sleep(1)
        # Test 1 : partie commencée sans présentateur
        await P[0].click('#lbGo');await asyncio.sleep(1)
        for pg in P: await pg.click('#rdBtn');await asyncio.sleep(.3)
        await asyncio.sleep(2)
        s=await P[1].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.turn,S.sc]}");print('avant présentateur',s)
        pres=await page('#presentateur');await asyncio.sleep(2.5)
        hm=[await pg.evaluate("()=>window.__dbg.hostMode") for pg in P]+[await pres.evaluate("()=>window.__dbg.hostMode")]
        s2=await pres.evaluate("()=>{const S=window.__dbg.ST;return S&&[S.ph,S.turn,S.sc]}");print('hôtes (joueurs..., présentateur)',hm,'état présentateur',s2)
        await pres.screenshot(path='p_game.png')
        # Test 2 : le présentateur passe et relance une partie
        await pres.click('#pSkip');await asyncio.sleep(1)
        print('après Passer',await P[0].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.cur]}"))
        await pres.evaluate("()=>{const S=window.__dbg.GM.S;S.ph='end';S.en++;}");await asyncio.sleep(1.2);await pres.screenshot(path='p_end.png')
        await pres.click('#pReset');await asyncio.sleep(1.5)
        print('après Nouvelle partie',await P[2].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.who,S.sc]}"))
        await pres.screenshot(path='p_lobby.png');await P[0].screenshot(path='p_player_lobby.png')
        await pres.click('#plGo');await asyncio.sleep(1.2);await pres.screenshot(path='p_rules.png');await P[0].screenshot(path='p_player_rules.png')
        await pres.click('#rdForce');await asyncio.sleep(1.5)
        for pg in P: await pg.evaluate(BOT)
        await asyncio.sleep(8);await pres.screenshot(path='p_play.png')
        print('jeu',await P[0].evaluate("()=>{const S=window.__dbg.ST;return [S.ph,S.turn,S.sc]}"))
        print('errs',errs[:5]);await b.close()
    srv.kill()
asyncio.run(main())
