from html import escape
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "assets" / "carrousel-amivoy"
OUT.mkdir(parents=True, exist_ok=True)
CREAM, GREEN, YELLOW, CORAL, MUTED = "#F7F1E4", "#17392C", "#F8CF3A", "#F15E43", "#657368"


def text(x, y, value, size=24, color=GREEN, weight=500, extra=""):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,Helvetica,sans-serif" font-size="{size}" font-weight="{weight}" {extra}>{escape(value)}</text>'


def header(number, dark=False):
    fg = CREAM if dark else GREEN
    return f'''<g transform="translate(66 55)"><circle cx="22" cy="22" r="22" fill="{YELLOW}"/><path d="M11 24c7-7 15-7 22 0M15 30c5-5 10-5 15 0" fill="none" stroke="{GREEN}" stroke-width="3.5" stroke-linecap="round"/><circle cx="22.5" cy="35" r="2.6" fill="{GREEN}"/><text x="59" y="31" fill="{fg}" font-family="Arial,Helvetica,sans-serif" font-size="31" font-weight="800" letter-spacing="-1">amivoy</text></g>
    {text(1014, 83, f'{number:02d} / 09', 14, fg, 700, 'text-anchor="end" letter-spacing="2"')}
    <path d="M66 116h948" stroke="{fg}" opacity=".24"/>'''


def page(number, bg, title, subtitle, scene, dark=False, eyebrow="AMIVOY · SORTIES & VOYAGES"):
    fg = CREAM if dark else GREEN
    sub = "#DCE7D9" if dark else MUTED
    title_nodes = "".join(text(66, 220 + i * 83, line, 66, fg, 900, 'letter-spacing="-3"') for i, line in enumerate(title.split("\n")))
    title_end = 220 + (len(title.split("\n")) - 1) * 83
    sub_y = title_end + 52
    scene_y = max(445, sub_y + 95)
    # Each scene is a viewBox-sized illustration positioned in a generous card area.
    scene_block = f'<g transform="translate(54 {scene_y})">{scene}</g>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img">
      <defs><pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="{GREEN}" opacity=".09"/></pattern><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="15" stdDeviation="17" flood-color="{GREEN}" flood-opacity=".16"/></filter></defs>
      <rect width="1080" height="1350" fill="{bg}"/><rect width="1080" height="1350" fill="url(#grain)"/>
      {header(number, dark)}{text(69, 169, eyebrow, 14, YELLOW if dark else CORAL, 800, 'letter-spacing="2.5"')}{title_nodes}{text(70, sub_y, subtitle, 22, sub, 500)}{scene_block}
      <path d="M66 1279h948" stroke="{fg}" opacity=".24"/>
      {text(67, 1318, 'TON GROUPE. VOS PLANS. VOS SOUVENIRS.', 13, fg, 700, 'letter-spacing="1.5"')}
      {text(1013, 1318, 'AMIVOY  ✳', 15, YELLOW if dark else CORAL, 900, 'text-anchor="end"')}
    </svg>'''


def card(x, y, w, h, fill=CREAM, radius=28):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>'


def avatar(x, y, fill, initials, r=34):
    label = text(x, y + 7, initials, 18, CREAM, 800, 'text-anchor="middle"')
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{CREAM}" stroke-width="5"/>{label}'


slides = []

# 1 — Cover: travel poster, ticket collage and welcoming group.
cover_scene = f'''<circle cx="752" cy="202" r="203" fill="{CORAL}"/><circle cx="752" cy="202" r="174" fill="none" stroke="{YELLOW}" stroke-width="3" stroke-dasharray="3 14"/>
  <circle cx="818" cy="159" r="49" fill="{YELLOW}"/><path d="M550 305q110-108 213 0t238-1v156H550z" fill="#6A936D"/><path d="M550 371q104-77 202-1t249 0v91H550z" fill="{GREEN}"/>
  <path d="M575 365c70-94 135 45 205-24s112-75 174-7" fill="none" stroke="{YELLOW}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16"/>
  <g transform="rotate(-7 282 235)" filter="url(#shadow)">{card(70,88,430,280,CREAM,22)}<path d="M70 240q20-25 0-50v-80h430v80q-20 25 0 50v118H70z" fill="{CREAM}"/><path d="M405 121v211" stroke="{GREEN}" opacity=".25" stroke-width="2" stroke-dasharray="7 10"/>
  {text(104,145,'VOTRE PROCHAIN PLAN',14,CORAL,800,'letter-spacing="2"')}{text(104,204,'On part',48,GREEN,900,'letter-spacing="-2"')}{text(104,260,'ensemble ?',48,GREEN,900,'letter-spacing="-2"')}{text(104,312,'Une idée suffit pour commencer.',16,MUTED,500)}<circle cx="450" cy="225" r="29" fill="{YELLOW}"/>{text(450,235,'✳',30,GREEN,800,'text-anchor="middle"')}</g>
  {avatar(647,419,'#C77D63','M',29)}{avatar(706,419,'#8DAB7A','A',29)}{avatar(765,419,'#D5A943','S',29)}{avatar(824,419,'#8299AD','+',29)}'''
slides.append(page(1, GREEN, 'Et si on', 'se faisait de vrais souvenirs ?', cover_scene, True, 'UNE APP POUR VIVRE VOS PLANS ENSEMBLE'))

# 2 — Circle, friends and invitations.
group_scene = f'''{card(22,12,982,600,'#E9EDDF',34)}<path d="M246 201L490 118l269 95-257 166z" fill="none" stroke="{GREEN}" stroke-width="4" stroke-dasharray="6 12" opacity=".32"/>
 {avatar(247,201,'#C77D63','M',47)}{avatar(490,118,'#8DAB7A','A',47)}{avatar(759,213,'#D5A943','S',47)}{avatar(502,380,'#8299AD','L',47)}
 {text(491,478,'Votre bande, réunie au même endroit.',25,GREEN,800,'text-anchor="middle"')}{text(491,517,'Créez votre cercle et invitez vos proches.',18,MUTED,500,'text-anchor="middle"')}
 <rect x="286" y="548" width="412" height="46" rx="23" fill="{GREEN}"/>{text(492,578,'MON CERCLE  ·  4 AMIS',15,CREAM,800,'text-anchor="middle" letter-spacing="1"')}'''
slides.append(page(2, CREAM, 'La bande,', 'c’est le début de tout.', group_scene, False, '01 · VOTRE CERCLE'))

# 3 — Outing creation and event check-in.
outing_scene = f'''{card(24,12,478,580,CREAM,30)}{card(524,12,478,580,'#E8EFE4',30)}
 {text(60,68,'PROCHAINE SORTIE',14,CORAL,800,'letter-spacing="2"')}{text(60,125,'Pique-nique',31,GREEN,900)}{text(60,164,'au bord de l’eau',24,GREEN,700)}
 <rect x="60" y="199" width="405" height="156" rx="20" fill="#F4D59B"/><circle cx="358" cy="252" r="42" fill="{YELLOW}"/><path d="M60 321q88-90 160 0t245-7v41H60z" fill="#648B67"/><path d="M60 340q80-52 162 5t243-2v12H60z" fill="{GREEN}"/>
 {text(61,401,'SAMEDI  ·  16 H',15,CORAL,800,'letter-spacing="1.5"')}{text(61,441,'Cotonou',24,GREEN,800)}{text(61,481,'Rendez-vous au parc',17,MUTED,500)}
 <rect x="60" y="514" width="405" height="49" rx="24" fill="{GREEN}"/>{text(262,545,'JE SUIS PARTANT·E  ✓',15,CREAM,800,'text-anchor="middle" letter-spacing="1"')}
 {text(562,68,'TOUT LE MONDE AU COURANT',13,CORAL,800,'letter-spacing="1.3"')}{text(562,125,'On se retrouve',25,GREEN,900)}{text(562,160,'à 16 h !',25,GREEN,900)}
 {avatar(603,225,'#C77D63','M',28)}{text(650,222,'Mina',17,GREEN,800)}{text(650,245,'Partante',14,MUTED,500)}<circle cx="926" cy="226" r="18" fill="#DDE9D6"/>{text(926,232,'✓',17,GREEN,900,'text-anchor="middle"')}
 {avatar(603,302,'#8DAB7A','A',28)}{text(650,299,'Awa',17,GREEN,800)}{text(650,322,'Partante',14,MUTED,500)}<circle cx="926" cy="303" r="18" fill="#DDE9D6"/>{text(926,309,'✓',17,GREEN,900,'text-anchor="middle"')}
 {avatar(603,379,'#8299AD','L',28)}{text(650,376,'Léo',17,GREEN,800)}{text(650,399,'À confirmer',14,MUTED,500)}<circle cx="926" cy="380" r="18" fill="#F5E9CD"/>{text(926,386,'…',19,GREEN,900,'text-anchor="middle"')}
 <path d="M562 438h401" stroke="{GREEN}" opacity=".16"/>{text(562,482,'Lieu · date · heure · participants',16,GREEN,700)}{text(562,515,'Votre sortie, à votre façon.',15,MUTED,500)}'''
slides.append(page(3, '#F6EBDD', 'Une sortie ?', 'Choisissez le plan et retrouvez-vous.', outing_scene, False, '02 · LES SORTIES ENTRE AMIS'))

# 4 — Trips and practical organization.
trip_scene = f'''{card(21,10,979,592,'#E7EEE2',34)}<path d="M66 500c112-94 176-62 263-169s153-121 247-23 183 6 335-105" fill="none" stroke="{GREEN}" stroke-width="4" stroke-dasharray="4 15" stroke-linecap="round" opacity=".45"/>
 <circle cx="212" cy="410" r="17" fill="{CORAL}"/><circle cx="451" cy="293" r="17" fill="{CORAL}"/><circle cx="695" cy="308" r="17" fill="{CORAL}"/><circle cx="862" cy="204" r="17" fill="{CORAL}"/>
 {card(57,57,354,185,CREAM,24)}{text(88,101,'VOTRE VOYAGE',13,CORAL,800,'letter-spacing="2"')}{text(88,146,'Cap sur',31,GREEN,900)}{text(88,184,'la prochaine aventure',18,GREEN,700)}{text(88,216,'Destination à choisir ensemble',14,MUTED,500)}
 {card(574,375,373,190,GREEN,24)}{text(606,420,'CHECKLIST',13,YELLOW,800,'letter-spacing="2"')}
 <circle cx="618" cy="458" r="10" fill="{YELLOW}"/><path d="m613 458 4 4 7-9" fill="none" stroke="{GREEN}" stroke-width="2.5"/>{text(641,464,'Choisir les dates',17,CREAM,600)}
 <circle cx="618" cy="500" r="10" fill="{YELLOW}"/><path d="m613 500 4 4 7-9" fill="none" stroke="{GREEN}" stroke-width="2.5"/>{text(641,506,'Préparer les affaires',17,CREAM,600)}
 {text(641,544,'Et garder le programme sous la main.',13,'#DCE7D9',500)}
 <g transform="rotate(-6 850 110)"><rect x="771" y="53" width="155" height="66" rx="14" fill="{YELLOW}"/>{text(848,93,'ON DÉCOLLE ✈',15,GREEN,900,'text-anchor="middle"')}</g>'''
slides.append(page(4, GREEN, 'Le voyage,', 'ça se prépare ensemble aussi.', trip_scene, True, '03 · LES VOYAGES'))

# 5 — Discovery and map.
map_scene = f'''{card(21,8,980,600,'#E6ECDD',34)}
 <path d="M22 146q133-98 267-7t253 4q145-94 260-5t180-30v209q-123 91-239 5t-238 2q-136 83-268 8T22 375z" fill="#D0DEC9"/>
 <path d="M33 425q131-58 258 12t258-1q124-77 221-16t209-8v188H33z" fill="#EFC994" opacity=".7"/>
 <path d="M38 329c151-63 218 92 347 21s201-182 337-100 158 54 246-8" fill="none" stroke="{CORAL}" stroke-width="6" stroke-linecap="round" stroke-dasharray="3 16"/>
 <g transform="translate(280 205)"><path d="M28 0C12.5 0 0 12.5 0 28c0 21 28 51 28 51s28-30 28-51C56 12.5 43.5 0 28 0zm0 37a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" fill="{CORAL}"/></g>
 <g transform="translate(707 300)"><path d="M28 0C12.5 0 0 12.5 0 28c0 21 28 51 28 51s28-30 28-51C56 12.5 43.5 0 28 0zm0 37a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" fill="{GREEN}"/></g>
 {card(76,50,357,94,CREAM,22)}{text(105,88,'UNE ENVIE DE SORTIR ?',13,CORAL,800,'letter-spacing="1.5"')}{text(105,122,'Trouve un lieu à explorer',19,GREEN,800)}
 {card(540,462,408,104,CREAM,22)}{text(570,504,'DESTINATIONS · ADRESSES · IDÉES',12,CORAL,800,'letter-spacing="1"')}{text(570,540,'À vous de choisir la prochaine escale.',16,GREEN,700)}'''
slides.append(page(5, CREAM, 'Une envie ?', 'Explorez les lieux et trouvez votre prochain décor.', map_scene, False, '04 · LA DÉCOUVERTE'))

# 6 — Budget and shared contributions.
budget_scene = f'''{card(20,10,980,600,GREEN,34)}
 <circle cx="285" cy="305" r="158" fill="none" stroke="#315A45" stroke-width="32"/><circle cx="285" cy="305" r="158" fill="none" stroke="{YELLOW}" stroke-width="32" stroke-dasharray="445 548" stroke-linecap="round" transform="rotate(-90 285 305)"/><circle cx="285" cy="305" r="158" fill="none" stroke="{CORAL}" stroke-width="32" stroke-dasharray="217 776" stroke-linecap="round" transform="rotate(70 285 305)"/>
 {text(285,287,'BUDGET',15,'#DCE7D9',800,'text-anchor="middle" letter-spacing="2"')}{text(285,336,'à plusieurs',30,CREAM,900,'text-anchor="middle"')}
 {card(527,54,421,486,'#F7F1E4',25)}{text(565,100,'WEEK-END ENTRE AMIS',13,CORAL,800,'letter-spacing="1.5"')}{text(565,147,'On s’organise,',24,GREEN,900)}{text(565,179,'sans perdre le fil.',24,GREEN,900)}
 <path d="M565 205h345" stroke="{GREEN}" opacity=".15"/>{text(565,246,'Hébergement',17,MUTED,600)}{text(908,246,'45 000 F',17,GREEN,800,'text-anchor="end"')}
 <path d="M565 266h345" stroke="{GREEN}" opacity=".1"/>{text(565,306,'Repas',17,MUTED,600)}{text(908,306,'24 000 F',17,GREEN,800,'text-anchor="end"')}
 <path d="M565 326h345" stroke="{GREEN}" opacity=".1"/>{text(565,366,'Transport',17,MUTED,600)}{text(908,366,'18 000 F',17,GREEN,800,'text-anchor="end"')}
 <rect x="561" y="399" width="351" height="55" rx="17" fill="#E8EFE4"/>{text(583,434,'Part de chacun',16,GREEN,700)}{text(891,434,'21 750 F',18,GREEN,900,'text-anchor="end"')}
 {text(565,495,'Dépenses et participations réunies.',15,MUTED,500)}
 {text(285,541,'EXEMPLE ILLUSTRATIF · FCFA',13,'#DCE7D9',700,'text-anchor="middle" letter-spacing="1.5"')}'''
slides.append(page(6, '#E7EEE2', 'Un budget', 'plus simple à suivre quand il est partagé.', budget_scene, False, '05 · L’ORGANISATION DU GROUPE'))

# 7 — Memory book and story photos.
memory_scene = f'''{card(20,10,980,600,'#F3E4D2',34)}
 <g transform="rotate(-8 280 278)" filter="url(#shadow)">{card(79,69,350,409,CREAM,8)}<rect x="98" y="88" width="312" height="285" rx="3" fill="#D5A079"/><circle cx="312" cy="163" r="47" fill="{YELLOW}"/><path d="M98 322q62-90 120-7 64-105 113 5t79-26v79H98z" fill="#6A936D"/><path d="M98 351q61-48 127 9t185-4v17H98z" fill="{GREEN}"/>{text(100,421,'NOS MOMENTS PRÉFÉRÉS',13,CORAL,800,'letter-spacing="1.5"')}{text(100,452,'Le pique-nique ✳',21,GREEN,900)}</g>
 <g transform="rotate(7 690 268)" filter="url(#shadow)">{card(493,77,420,367,CREAM,8)}<rect x="513" y="97" width="380" height="250" rx="3" fill="#819B7B"/><circle cx="796" cy="152" r="39" fill="{YELLOW}"/><path d="M513 300q78-109 152-7 86-127 141 2t87-34v86H513z" fill="#496E51"/>{text(523,397,'STORY DE LA SORTIE',13,CORAL,800,'letter-spacing="1.5"')}</g>
 {avatar(642,508,'#C77D63','M',27)}{avatar(693,508,'#8DAB7A','A',27)}{avatar(744,508,'#D5A943','S',27)}{text(792,515,'Les souvenirs sont à vous.',18,GREEN,800)}'''
slides.append(page(7, CREAM, 'Le plan passe.', 'Les bons souvenirs restent.', memory_scene, False, '06 · LES SOUVENIRS'))

# 8 — All the pieces together, with an app-like overview.
all_scene = f'''{card(20,10,980,600,'#E7EEE2',34)}
 {card(54,54,448,222,GREEN,25)}{text(88,101,'VOTRE CERCLE',13,YELLOW,800,'letter-spacing="2"')}{text(88,152,'Les amis,',28,CREAM,900)}{text(88,189,'au même endroit.',28,CREAM,900)}{avatar(111,233,'#C77D63','M',23)}{avatar(162,233,'#8DAB7A','A',23)}{avatar(213,233,'#D5A943','S',23)}
 {card(526,54,448,222,'#F8CF3A',25)}{text(561,101,'VOS SORTIES',13,CORAL,800,'letter-spacing="2"')}{text(561,152,'Des idées',28,GREEN,900)}{text(561,189,'qui deviennent des plans.',21,GREEN,900)}<circle cx="892" cy="221" r="31" fill="{GREEN}"/>{text(892,232,'↗',30,YELLOW,900,'text-anchor="middle"')}
 {card(54,302,448,222,CORAL,25)}{text(88,349,'VOS VOYAGES',13,CREAM,800,'letter-spacing="2"')}{text(88,400,'La route',28,CREAM,900)}{text(88,437,'se dessine ensemble.',23,CREAM,900)}<path d="M91 480c82-63 134 35 214-19" fill="none" stroke="{YELLOW}" stroke-width="4" stroke-dasharray="3 11" stroke-linecap="round"/>
 {card(526,302,448,222,CREAM,25)}{text(561,349,'VOS SOUVENIRS',13,CORAL,800,'letter-spacing="2"')}{text(561,400,'À revivre',28,GREEN,900)}{text(561,437,'et à partager.',25,GREEN,900)}<circle cx="888" cy="468" r="35" fill="#E8EFE4"/>{text(888,480,'✳',26,GREEN,900,'text-anchor="middle"')}
 {text(512,574,'Une seule app pour préparer, vivre et se rappeler.',19,GREEN,800,'text-anchor="middle"')}'''
slides.append(page(8, GREEN, 'Tout votre', 'petit monde, au même endroit.', all_scene, True, '07 · AMIVOY EN UN COUP D’ŒIL'))

# 9 — Closing / save and share CTA without inventing store links.
cta_scene = f'''<circle cx="515" cy="288" r="229" fill="{YELLOW}"/><circle cx="515" cy="288" r="192" fill="none" stroke="{CORAL}" stroke-width="5" stroke-dasharray="4 17"/>
 <path d="M329 356q76-132 171-18 70-139 177-13v90H329z" fill="#6A936D"/><path d="M329 389q84-71 171 1 83-87 177-7v32H329z" fill="{GREEN}"/>
 {avatar(419,293,'#C77D63','M',35)}{avatar(516,252,'#8299AD','L',35)}{avatar(610,300,'#D5A943','A',35)}
 <path d="M357 411q154 71 316-8" fill="none" stroke="{CORAL}" stroke-width="5" stroke-dasharray="3 13" stroke-linecap="round"/>
 <g transform="rotate(-6 514 522)"><rect x="285" y="479" width="460" height="88" rx="24" fill="{GREEN}"/>{text(515,534,'À VOUS LE PROCHAIN PLAN ✳',23,CREAM,900,'text-anchor="middle" letter-spacing="1"')}</g>
 {text(514,643,'Sorties · Voyages · Souvenirs',19,MUTED,700,'text-anchor="middle"')}'''
slides.append(page(9, '#F6EBDD', 'Votre bande.', 'Votre prochaine histoire.', cta_scene, False, 'AMIVOY · À VIVRE ENSEMBLE'))


for idx, content in enumerate(slides, start=1):
    (OUT / f"slide-{idx:02d}.svg").write_text(content, encoding="utf-8")

# A single tall contact sheet is rendered by the export command and cropped into
# the individual, Instagram-ready PNG/JPG slides.
imgs = "".join(f'<image href="slide-{idx:02d}.svg" x="0" y="{(idx-1)*1350}" width="1080" height="1350"/>' for idx in range(1, 10))
sheet = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="12150" viewBox="0 0 1080 12150">{imgs}</svg>'
(OUT / "contact-sheet.svg").write_text(sheet, encoding="utf-8")
