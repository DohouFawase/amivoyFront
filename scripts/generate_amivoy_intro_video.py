from math import sin, cos, pi
from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "video-intro-amivoy"
OUT.mkdir(parents=True, exist_ok=True)
VIDEO = OUT / "Amivoy-introduction-reseaux-sociaux.mp4"
W, H, FPS, DURATION = 1080, 1920, 24, 20
GREEN = (23, 57, 44)
GREEN2 = (34, 81, 59)
CREAM = (247, 241, 228)
YELLOW = (248, 207, 58)
CORAL = (241, 94, 67)
MUTED = (101, 115, 104)
PALE = (232, 239, 228)
PEACH = (246, 235, 221)
HEAD = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf"), 88)
HEAD_BIG = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf"), 112)
HEAD_MED = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf"), 66)
BODY = ImageFont.truetype("/usr/share/fonts/truetype/lato/Lato-Medium.ttf", 38)
BODY_BOLD = ImageFont.truetype("/usr/share/fonts/truetype/lato/Lato-Bold.ttf", 34)
SMALL = ImageFont.truetype("/usr/share/fonts/truetype/lato/Lato-Bold.ttf", 24)
TINY = ImageFont.truetype("/usr/share/fonts/truetype/lato/Lato-Bold.ttf", 19)


def ease(v):
    v = max(0.0, min(1.0, v))
    return v * v * (3 - 2 * v)


def clamp(v):
    return max(0.0, min(1.0, v))


def blend(a, b, t):
    t = clamp(t)
    return tuple(round(x + (y-x)*t) for x,y in zip(a,b))


def center(draw, xy, value, font, fill, anchor="mm"):
    draw.text(xy, value, font=font, fill=fill, anchor=anchor)


def fit_font(value, max_width, start, font_path):
    size = start
    while size > 26:
        f = ImageFont.truetype(font_path, size)
        if f.getbbox(value)[2] <= max_width:
            return f
        size -= 2
    return ImageFont.truetype(font_path, size)


def logo(draw, y, color=CREAM, scale=1.0, alpha=255):
    ink = (*color, alpha)
    yellow = (*YELLOW, alpha)
    cx = W//2
    r = int(47*scale)
    draw.ellipse((cx-r, y-r, cx+r, y+r), fill=yellow)
    sw = max(3, int(7*scale))
    draw.arc((cx-24*scale, y-18*scale, cx+24*scale, y+20*scale), 205, 335, fill=(*GREEN,alpha), width=sw)
    draw.arc((cx-15*scale, y-6*scale, cx+15*scale, y+18*scale), 205, 335, fill=(*GREEN,alpha), width=sw)
    draw.ellipse((cx-4*scale,y+15*scale,cx+4*scale,y+23*scale), fill=(*GREEN,alpha))
    f = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf"), int(83*scale))
    draw.text((cx, y+108*scale), "amivoy", font=f, fill=ink, anchor="mm")


def pill(draw, xy, label, bg, fg, font=SMALL, pad=26, height=62):
    x,y = xy
    box = draw.textbbox((0,0), label, font=font)
    width = box[2] + pad*2
    draw.rounded_rectangle((x,y,x+width,y+height), radius=height//2, fill=bg)
    draw.text((x+width/2,y+height/2),label,font=font,fill=fg,anchor="mm")
    return width


def background(color, seed=0):
    im = Image.new("RGB", (W,H), color)
    d = ImageDraw.Draw(im, "RGBA")
    # Quiet, consistent grain and oversized ambient circles.
    for i in range(90):
        x = (i*137 + seed*53) % W
        y = (i*251 + seed*97) % H
        d.ellipse((x,y,x+3,y+3), fill=(255,255,255,17))
    return im


def round_card(im, box, color=CREAM, radius=34, shadow=True):
    if shadow:
        layer = Image.new("RGBA", im.size, (0,0,0,0))
        d = ImageDraw.Draw(layer)
        x0,y0,x1,y1=box
        d.rounded_rectangle((x0,y0+18,x1,y1+18),radius=radius,fill=(5,31,20,56))
        layer = layer.filter(ImageFilter.GaussianBlur(22))
        im.paste(layer,(0,0),layer)
    ImageDraw.Draw(im).rounded_rectangle(box,radius=radius,fill=color)


def scene_one(t):
    im = background(GREEN, 1); d = ImageDraw.Draw(im, "RGBA")
    p = ease(t)
    # Orbiting destination sun and a dotted route.
    cx,cy=815,1120
    radius=230 + int(24*sin(t*pi))
    d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),fill=(*CORAL,235))
    d.ellipse((cx-185,cy-185,cx+185,cy+185),outline=(*YELLOW,140),width=4)
    for i in range(48):
        a=2*pi*i/48
        x=cx+195*cos(a); y=cy+195*sin(a)
        d.ellipse((x-3,y-3,x+3,y+3),fill=(*YELLOW,210))
    d.ellipse((cx+60-58,cy-110-58,cx+60+58,cy-110+58),fill=YELLOW)
    d.polygon([(590,1270),(755,1032),(877,1269)],fill=(114,151,113))
    d.polygon([(733,1267),(869,1064),(1024,1267)],fill=(70,116,78))
    d.polygon([(590,1300),(765,1178),(916,1287),(1080,1192),(1080,1405),(590,1405)],fill=GREEN2)
    route=[(80,1510),(265,1432),(430,1487),(592,1415),(754,1457),(932,1362)]
    d.line(route,fill=(*YELLOW,150),width=5)
    for (x,y) in route:
        d.ellipse((x-6,y-6,x+6,y+6),fill=(*YELLOW,220))
    dotx=80+(932-80)*t; doty=1510-148*t+22*sin(t*pi*3)
    d.ellipse((dotx-17,doty-17,dotx+17,doty+17),fill=CREAM)
    alpha=int(255*ease(t*3.0))
    logo(d, 330, CREAM, .88, alpha)
    head=fit_font("Les bons plans",800,HEAD_BIG.size,str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf"))
    center(d,(W//2,610),"Les bons plans",head,(*CREAM,alpha))
    center(d,(W//2,724),"commencent ensemble.",fit_font("commencent ensemble.",900,79,str(ROOT / "assets" / "fonts" / "CabinetGrotesk-Bold.ttf")),(*CREAM,alpha))
    center(d,(W//2,1580),"SORTIES  ·  VOYAGES  ·  SOUVENIRS",SMALL,(*YELLOW,alpha))
    return im


def scene_two(t):
    im=background(CREAM,2); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((740,-110,1250,405),fill=(*YELLOW,145))
    d.text((72,130),"01  /  SORTIR",font=SMALL,fill=CORAL)
    d.text((72,220),"Une idée de sortie ?",font=fit_font("Une idée de sortie ?",930,HEAD_BIG.size,str(ROOT/"assets/fonts/CabinetGrotesk-Bold.ttf")),fill=GREEN)
    prog=ease(t)
    y=int(600+140*(1-prog))
    round_card(im,(58,y,1022,y+608),CREAM,36)
    d=ImageDraw.Draw(im,"RGBA")
    d.rounded_rectangle((92,y+35,988,y+337),radius=25,fill=(234,213,166))
    d.ellipse((730,y+80,862,y+212),fill=YELLOW)
    d.polygon([(92,y+290),(270,y+140),(405,y+294),(568,y+180),(747,y+300),(988,y+216),(988,y+337),(92,y+337)],fill=(104,144,104))
    d.polygon([(92,y+317),(282,y+253),(454,y+319),(661,y+260),(825,y+322),(988,y+282),(988,y+337),(92,y+337)],fill=GREEN2)
    d.text((115,y+384),"SAMEDI  ·  16 H",font=SMALL,fill=CORAL)
    d.text((115,y+438),"Pique-nique au bord de l’eau",font=fit_font("Pique-nique au bord de l’eau",800,49,str(ROOT/"assets/fonts/CabinetGrotesk-Bold.ttf")),fill=GREEN)
    d.text((115,y+505),"Cotonou  ·  4 amis",font=BODY,fill=MUTED)
    pill(d,(115,y+546),"ON S’ORGANISE",GREEN,CREAM)
    d.text((72,1322),"Lieu, date, heure et groupe : les détails du plan.",font=BODY,fill=MUTED)
    return im


def scene_three(t):
    im=background(PALE,3); d=ImageDraw.Draw(im,"RGBA")
    d.text((72,130),"02  /  VOYAGER",font=SMALL,fill=CORAL)
    d.text((72,220),"Une aventure à préparer ?",font=fit_font("Une aventure à préparer ?",930,HEAD.size,str(ROOT/"assets/fonts/CabinetGrotesk-Bold.ttf")),fill=GREEN)
    # Winding dotted route animates from left to right.
    route=[(112,714),(235,614),(350,685),(465,539),(582,626),(713,462),(831,558),(963,438)]
    d.line(route,fill=(143,166,133),width=7)
    for i,(x,y) in enumerate(route):
        color=CORAL if i in (0,3,7) else GREEN2
        d.ellipse((x-18,y-18,x+18,y+18),fill=color,outline=CREAM,width=5)
    index=int(t*7)
    dx,dy=route[min(index,7)]
    d.ellipse((dx-31,dy-31,dx+31,dy+31),outline=YELLOW,width=8)
    round_card(im,(68,835,1012,1175),GREEN,32)
    d=ImageDraw.Draw(im,"RGBA")
    d.text((112,883),"UN VOYAGE, PLUSIEURS ÉTAPES",font=TINY,fill=YELLOW)
    d.text((112,932),"Destination · programme · checklist",font=fit_font("Destination · programme · checklist",830,42,str(ROOT/"assets/fonts/CabinetGrotesk-Bold.ttf")),fill=CREAM)
    d.line((113,1000,965,1000),fill=(255,255,255,68),width=2)
    for i,label in enumerate(("Choisir ensemble","Préparer le départ","Garder le fil")):
        yy=1045+i*42
        d.ellipse((115,yy-13,141,yy+13),fill=YELLOW if i <= int(t*3) else (79,114,87))
        if i <= int(t*3): d.line((121,yy,127,yy+6,137,yy-7),fill=GREEN,width=3)
        d.text((163,yy),label,font=SMALL,fill=CREAM,anchor="lm")
    return im


def photo_card(label, color, rotation, t):
    tile=Image.new("RGBA",(450,520),(0,0,0,0)); d=ImageDraw.Draw(tile)
    d.rounded_rectangle((9,9,441,511),radius=18,fill=CREAM)
    d.rounded_rectangle((27,27,423,383),radius=11,fill=color)
    d.ellipse((292,66,380,154),fill=YELLOW)
    d.polygon([(27,339),(126,229),(201,339),(291,216),(423,344),(423,383),(27,383)],fill=(96,139,96))
    d.polygon([(27,362),(148,308),(244,366),(331,306),(423,359),(423,383),(27,383)],fill=GREEN2)
    d.text((33,429),label,font=SMALL,fill=CORAL)
    d.text((33,468),"AMIVOY · NOS MOMENTS",font=TINY,fill=GREEN)
    return tile.rotate(rotation,Image.Resampling.BICUBIC,expand=True)


def scene_four(t):
    im=background(PEACH,4); d=ImageDraw.Draw(im,"RGBA")
    d.text((72,130),"03  /  SOUVENIRS",font=SMALL,fill=CORAL)
    d.text((72,220),"Et les souvenirs ?",font=HEAD_BIG,fill=GREEN)
    progress=ease(t)
    left=photo_card("PIQUE-NIQUE · SAMEDI",(220,164,126),-8,progress)
    right=photo_card("NOTRE ESCAPADE",(127,159,132),7,progress)
    # Cards drift into their final positions.
    lx=int(-90+180*progress); rx=int(460+170*progress)
    ly=int(540+35*(1-progress)); ry=int(580-25*(1-progress))
    im.paste(left,(lx,ly),left); im.paste(right,(rx,ry),right)
    d=ImageDraw.Draw(im,"RGBA")
    pill(d,(175,1180),"LES MOMENTS QU’ON VEUT GARDER",GREEN,CREAM,SMALL,30,68)
    return im.convert("RGB")


def scene_five(t):
    im=background(GREEN,5); d=ImageDraw.Draw(im,"RGBA")
    # Dots connect the three ideas into a loop around the brand.
    d.arc((104,338,976,1210),196,344,fill=(*YELLOW,150),width=5)
    d.arc((145,379,935,1169),202,338,fill=(*CORAL,190),width=5)
    for angle,color in ((-55,CORAL),(66,YELLOW),(184,(112,155,119))):
        rad=pi*angle/180
        x=540+364*cos(rad); y=775+364*sin(rad)
        d.ellipse((x-17,y-17,x+17,y+17),fill=color)
    alpha=int(255*ease(t*2))
    logo(d,535,CREAM,1.06,alpha)
    center(d,(540,790),"Sorties · Voyages · Souvenirs",BODY_BOLD,(*CREAM,alpha))
    center(d,(540,860),"Votre groupe, vos plans, vos moments.",BODY,(*CREAM,alpha))
    pill(d,(326,1002),"SUIVEZ L’AVENTURE",YELLOW,GREEN,BODY_BOLD,35,75)
    d.rounded_rectangle((251,1160,829,1224),radius=30,fill=(255,255,255,22),outline=(*CREAM,65),width=2)
    center(d,(540,1192),"PROJET EN DÉVELOPPEMENT",SMALL,(*CREAM,alpha))
    return im


SCENES = [scene_one, scene_two, scene_three, scene_four, scene_five]
SEGMENT = DURATION / len(SCENES)


def frame_at(seconds):
    idx=min(int(seconds/SEGMENT),len(SCENES)-1)
    local=(seconds-idx*SEGMENT)/SEGMENT
    current=SCENES[idx](local)
    fade=.42
    # Gentle cross-dissolves keep the short intro flowing between sections.
    remain=SEGMENT*(idx+1)-seconds
    if idx < len(SCENES)-1 and remain < fade:
        nxt=SCENES[idx+1](0.0)
        current=Image.blend(current,nxt,ease(1-remain/fade))
    return current


def main():
    pipeline=["gst-launch-1.0","-e","-q","fdsrc","fd=0","!","rawvideoparse","format=RGB","width=1080","height=1920",f"framerate={FPS}/1","!","videoconvert","!","video/x-raw,format=I420","!","x264enc","bitrate=5000","speed-preset=ultrafast","tune=zerolatency","!","mp4mux","faststart=true","!","filesink",f"location={VIDEO}"]
    proc=subprocess.Popen(pipeline,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    cover=None
    total=FPS*DURATION
    try:
        for frame_no in range(total):
            t=frame_no/FPS
            im=frame_at(t)
            if frame_no==24*18:
                cover=im.copy()
            if cover is None and frame_no==FPS*2:
                cover=im.copy()
            proc.stdin.write(im.tobytes())
            if frame_no % (FPS*4)==0:
                print(f"Rendu {frame_no//FPS:02d}/{DURATION} s",flush=True)
        proc.stdin.close()
        error=proc.stderr.read().decode("utf-8","replace")
        status=proc.wait()
        if status:
            raise RuntimeError(error[-4000:] or f"GStreamer exited with status {status}")
    except BrokenPipeError as exc:
        error=proc.stderr.read().decode("utf-8","replace")
        raise RuntimeError(error[-4000:] or str(exc))
    if cover:
        cover.save(OUT/"Amivoy-intro-cover.jpg",quality=94)
    (OUT/"Texte-video-et-voix-off.txt").write_text(
        "INTRO AMIVOY · 20 SECONDES · FORMAT VERTICAL 9:16\n\n"
        "Texte à l’écran / suggestion de voix off :\n"
        "0–4 s : Les bons plans commencent ensemble.\n"
        "4–8 s : Une idée de sortie ? Lieu, date, heure et groupe.\n"
        "8–12 s : Une aventure à préparer ? Destination, programme, checklist.\n"
        "12–16 s : Et les souvenirs ? Les moments qu’on veut garder.\n"
        "16–20 s : Amivoy. Sorties, voyages, souvenirs. Suivez l’aventure.\n"
        "Carton final : Projet en développement.\n\n"
        "Vidéo sans musique ni voix intégrées, prête à recevoir une narration ou une piste sonore libre de droits.\n",
        encoding="utf-8")
    print(f"Créé : {VIDEO}")


if __name__ == "__main__":
    main()
