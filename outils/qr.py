import sys
ECC={'L':([-1,7,10,15,20,26,18,20,24,30,18],[-1,1,1,1,1,1,2,2,2,2,4],1),'M':([-1,10,16,26,18,24,16,18,22,22,26],[-1,1,1,1,2,2,4,4,4,5,5],0)}
def gmul(x,y):
    z=0
    for i in range(7,-1,-1):
        z=(z<<1)^((z>>7)*0x11D); z^=((y>>i)&1)*x
    return z&0xFF
def rs_div(deg):
    r=[0]*(deg-1)+[1];root=1
    for _ in range(deg):
        for j in range(deg):
            r[j]=gmul(r[j],root)
            if j+1<deg: r[j]^=r[j+1]
        root=gmul(root,2)
    return r
def rs_rem(data,div):
    r=[0]*len(div)
    for b in data:
        f=b^r.pop(0);r.append(0)
        for i,c in enumerate(div): r[i]^=gmul(c,f)
    return r
def raw_mod(v):
    r=(16*v+128)*v+64
    if v>=2:
        n=v//7+2;r-=(25*n-10)*n-55
        if v>=7: r-=36
    return r
def make(text,ecl='M',mask=None):
    data=text.encode('utf-8')
    eccpb,nblk,fb=ECC[ecl]
    for v in range(1,11):
        cap=raw_mod(v)//8-eccpb[v]*nblk[v]
        if 4+8+len(data)*8<=cap*8: break
    bits=[]
    def ap(val,n):
        for i in range(n-1,-1,-1): bits.append((val>>i)&1)
    ap(4,4);ap(len(data),8)
    for b in data: ap(b,8)
    cap=raw_mod(v)//8-eccpb[v]*nblk[v]
    ap(0,min(4,cap*8-len(bits)))
    ap(0,(-len(bits))%8)
    pad=0xEC
    while len(bits)<cap*8: ap(pad,8);pad^=0xEC^0x11
    cw=[int(''.join(map(str,bits[i:i+8])),2) for i in range(0,len(bits),8)]
    nb=nblk[v];el=eccpb[v];raw=raw_mod(v)//8;nshort=nb-raw%nb;slen=raw//nb
    div=rs_div(el);blocks=[];k=0
    for i in range(nb):
        dat=cw[k:k+slen-el+(0 if i<nshort else 1)];k+=len(dat)
        e=rs_rem(dat,div)
        if i<nshort: dat=dat+[0]
        blocks.append(dat+e)
    out=[]
    for i in range(len(blocks[0])):
        for j,b in enumerate(blocks):
            if i!=slen-el or j>=nshort: out.append(b[i])
    size=v*4+17
    M=[[False]*size for _ in range(size)];F=[[False]*size for _ in range(size)]
    def sf(x,y,d): M[y][x]=d;F[y][x]=True
    for i in range(size): sf(6,i,i%2==0);sf(i,6,i%2==0)
    def finder(cx,cy):
        for dy in range(-4,5):
            for dx in range(-4,5):
                x,y=cx+dx,cy+dy
                if 0<=x<size and 0<=y<size:
                    d=max(abs(dx),abs(dy));sf(x,y,d!=2 and d!=4)
    finder(3,3);finder(size-4,3);finder(3,size-4)
    if v>1:
        n=v//7+2;step=(v*4+n*2+1)//(n*2-2)*2
        pos=[6]+list(reversed([size-7-i*step for i in range(n-1)]))
        for i,a in enumerate(pos):
            for j,b in enumerate(pos):
                if (i==0 and j==0) or (i==0 and j==n-1) or (i==n-1 and j==0): continue
                for dy in range(-2,3):
                    for dx in range(-2,3): sf(a+dx,b+dy,max(abs(dx),abs(dy))!=1)
    def fmt(msk,draw=True):
        d=fb<<3|msk;r=d
        for _ in range(10): r=(r<<1)^((r>>9)*0x537)
        b=(d<<10|r)^0x5412
        g=lambda i:((b>>i)&1)!=0
        for i in range(6): sf(8,i,g(i))
        sf(8,7,g(6));sf(8,8,g(7));sf(7,8,g(8))
        for i in range(9,15): sf(14-i,8,g(i))
        for i in range(8): sf(size-1-i,8,g(i))
        for i in range(8,15): sf(8,size-15+i,g(i))
        sf(8,size-8,True)
    fmt(0)
    i=0;right=size-1
    while right>=1:
        if right==6: right=5
        for vert in range(size):
            for j in range(2):
                x=right-j;up=((right+1)&2)==0;y=size-1-vert if up else vert
                if not F[y][x] and i<len(out)*8:
                    M[y][x]=((out[i>>3]>>(7-(i&7)))&1)!=0;i+=1
        right-=2
    conds=[lambda x,y:(x+y)%2==0,lambda x,y:y%2==0,lambda x,y:x%3==0,lambda x,y:(x+y)%3==0,lambda x,y:(x//3+y//2)%2==0,lambda x,y:x*y%2+x*y%3==0,lambda x,y:(x*y%2+x*y%3)%2==0,lambda x,y:((x+y)%2+x*y%3)%2==0]
    msk=mask if mask is not None else 0
    for y in range(size):
        for x in range(size):
            if not F[y][x] and conds[msk](x,y): M[y][x]=not M[y][x]
    fmt(msk)
    return M,v
def svg(M,dark='#14213D',light='#ffffff'):
    n=len(M);q=4;s=n+2*q
    p=''.join('M%d %dh1v1h-1z'%(x+q,y+q) for y in range(n) for x in range(n) if M[y][x])
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges" role="img" aria-label="QR code du jeu"><rect width="%d" height="%d" fill="%s"/><path d="%s" fill="%s"/></svg>'%(s,s,s,s,light,p,dark)
def png(M,path,scale=10):
    from PIL import Image
    n=len(M);q=4;im=Image.new('L',((n+2*q)*scale,)*2,255)
    for y in range(n):
        for x in range(n):
            if M[y][x]:
                for a in range(scale):
                    for b in range(scale): im.putpixel(((x+q)*scale+b,(y+q)*scale+a),0)
    im.save(path)
if __name__=='__main__':
    import cv2
    url=sys.argv[1]
    for m in range(8):
        M,v=make(url,'M',m);png(M,'t.png')
        d=cv2.QRCodeDetector().detectAndDecode(cv2.imread('t.png'))[0]
        print('mask',m,'version',v,'decoded:',repr(d),'OK' if d==url else 'FAIL')
