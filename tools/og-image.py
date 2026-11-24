# Draws the link-preview image (src/og.png) as tools/og.svg. To render it, convert the fonts in
# src/fonts to TTF (fontTools), point a fontconfig file at them, then run on the host:
#   FONTCONFIG_FILE=<conf> rsvg-convert -w 1200 -h 630 tools/og.svg -o src/og.png
# The subset fonts register as "Barlow Condensed SemiBold" / "Medium", hence those names below.
import random
random.seed(11)
W,H=1200,630
cols=['#d7262b','#3b8fd9','#2b4fb8','#e0861a','#2f9e44','#9b4dca','#0f9d8a','#e0457b','#c99a00']
rows=[110,200,290,380,470,560]
xs=[730,880,1030,1180]
xs=[730,880,1030,1180]
cols_rows={0:[110,290,470],1:[200,380,560],2:[110,290,470],3:[200,380,560]}
boxes=[]
k=0
for ci,ys in cols_rows.items():
    for y in ys:
        boxes.append((xs[ci],y,cols[k%len(cols)],ci));k+=1
L=[((0,110),(1,200),0),((0,290),(1,200),1),((0,290),(1,380),0),((0,470),(1,380),0),((0,470),(1,560),0),((1,200),(2,110),0),((1,200),(2,290),1),((1,380),(2,290),0),((1,380),(2,470),0),((1,560),(2,470),0),((2,110),(3,200),0),((2,290),(3,200),1),((2,290),(3,380),0),((2,470),(3,560),0)]
lines=''
for (a,ya),(b,yb),hot in L:
    x,x2=xs[a],xs[b]
    lines+=f'<path d="M{x+55} {ya} C{x+105} {ya} {x2-105} {yb} {x2-55} {yb}" fill="none" stroke="{"#ff5c61" if hot else "#ecebe6"}" stroke-width="{4 if hot else 2.5}" opacity="{1 if hot else .4}"/>'
bx=''
for (x,y,c,ci) in boxes:
    bx+=f'<rect x="{x-62}" y="{y-29}" width="124" height="58" rx="10" fill="#111318"/><rect x="{x-55}" y="{y-22}" width="110" height="44" rx="7" fill="#1f222b" stroke="#ecebe6" stroke-width="2"/><rect x="{x-52}" y="{y-14}" width="6" height="28" rx="2" fill="{c}"/><rect x="{x-38}" y="{y-5}" width="{random.randint(40,70)}" height="10" rx="5" fill="#9a9ca3" opacity=".6"/>'
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect width="{W}" height="{H}" fill="#111318"/>
<g>{lines}{bx}</g>
<rect width="640" height="{H}" fill="#111318"/>
<rect x="640" width="20" height="{H}" fill="#111318" opacity=".6"/>
<text x="64" y="250" font-family="Anton" font-size="112" fill="#ecebe6">SAFE TO</text>
<text x="64" y="370" font-family="Anton" font-size="112" fill="#ff5c61">WATCH</text>
<text x="66" y="440" font-family="Barlow Condensed SemiBold" font-weight="600" font-size="38" fill="#ecebe6">A spoiler-free MCU guide: what to</text>
<text x="66" y="484" font-family="Barlow Condensed SemiBold" font-weight="600" font-size="38" fill="#ecebe6">watch first, and what's safe next.</text>
<text x="66" y="568" font-family="Barlow Condensed Medium" font-weight="500" font-size="26" fill="#9a9ca3">Unofficial fan project</text>
</svg>'''
open('tools/og.svg','w').write(svg)
