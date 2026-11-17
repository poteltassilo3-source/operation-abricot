"""Assemble les sources en un seul fichier index.html (à la racine du dépôt)."""
import os
ICI=os.path.dirname(os.path.abspath(__file__))
PARTIES=['shared1.js','shared2.js','data.js','game.js','view.js','net.js']
code='\n'.join(open(os.path.join(ICI,f),encoding='utf-8').read() for f in PARTIES)
page=open(os.path.join(ICI,'template.html'),encoding='utf-8').read().replace('/*CODE*/',code)
open(os.path.join(ICI,'..','index.html'),'w',encoding='utf-8').write(page)
print('index.html reconstruit')
