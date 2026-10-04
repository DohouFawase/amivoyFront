from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "carrousel-instagram-90-jours"
OUT.mkdir(parents=True, exist_ok=True)
GREEN, CREAM, YELLOW, CORAL, MUTED = "#17392C", "#F7F1E4", "#F8CF3A", "#F15E43", "#657368"

# Day, theme, hook, insight, Amivoy angle, question, caption.
POSTS = [
(1,"L’idée de départ","Les bons plans\ncommencent comment ?","Souvent par une idée… puis viennent les messages : où, quand, qui vient ?","Amivoy explore une façon de réunir sorties, voyages et souvenirs de groupe.","Qu’est-ce qui complique le plus les plans dans ton groupe ?","Une idée de sortie, dix messages pour choisir ? Je construis Amivoy pour explorer une organisation plus simple des sorties et voyages entre amis. Le projet est en développement. Qu’est-ce qui coince le plus souvent dans ton groupe ?"),
(3,"Les coulisses","Pourquoi je construis\nAmivoy","Je veux comprendre ce qui rend l’organisation de groupe plus compliquée qu’elle ne devrait l’être.","Je partage ici les vraies étapes : les choix, les maquettes et ce qu’il reste à apprendre.","Qu’aimerais-tu voir des coulisses du projet ?","Amivoy part d’une situation familière : « On fait quoi ? » Je vais raconter ici la construction du projet, y compris les essais et les difficultés. Quel sujet veux-tu découvrir en premier ?"),
(5,"Sorties et voyages","Petit plan ou\ngrande aventure ?","Un dîner ce week-end et un voyage entre amis ont un point commun : il faut décider ensemble.","Amivoy est pensé autour de ces moments partagés, du plan local au départ en groupe.","Tu commencerais par une sortie ou un voyage ?","Du restaurant du samedi à l’escapade entre amis, les bons moments se préparent à plusieurs. Tu utiliserais Amivoy d’abord pour une sortie ou un voyage ?"),
(8,"Choisir un lieu","« On va où ? »\nencore…","Le prix, la distance, l’ambiance ou les avis : chaque personne a ses critères.","Avant d’imaginer des fonctions, je veux mieux comprendre comment les groupes choisissent.","Quel critère compte le plus pour toi ?","Choisir le lieu peut prendre plus de temps que la sortie 😄 Dans ton groupe, qu’est-ce qui compte le plus : prix, distance, ambiance ou avis ?"),
(10,"Infos éparpillées","L’heure est où ?\nEt l’adresse ?","Les infos d’un plan se perdent vite entre les messages et les changements.","Amivoy cherche à rassembler les détails utiles d’une sortie dans un même parcours.","Quel détail se perd le plus souvent chez vous ?","L’adresse dans un message, l’heure dans un autre, puis le programme change… C’est ce désordre que je veux réduire avec Amivoy. Quel détail oubliez-vous le plus souvent ?"),
(12,"Découvrir près de soi","Pas besoin d’aller\nloin pour sortir","Un nouveau restaurant, un concert ou une balade peut devenir un beau souvenir.","Amivoy s’intéresse aussi aux sorties locales et aux idées près de chez soi.","Quelle activité locale recommandes-tu ?","Pas besoin de partir loin pour découvrir quelque chose. Quelle activité ou quelle adresse recommanderais-tu dans ta ville ?"),
(15,"Le cercle d’amis","Les mêmes amis.\nMoins de messages.","On organise souvent avec les mêmes personnes, mais les infos se dispersent.","Les cercles d’amis font partie des idées explorées dans Amivoy.","Un cercle par groupe ou un seul grand cercle ?","Avec qui organises-tu le plus souvent tes sorties ? Je travaille sur le concept de cercles d’amis dans Amivoy. Tu préférerais un cercle par groupe ou un grand cercle pour tout le monde ?"),
(17,"Inviter quelqu’un","Et si ton ami\nn’a pas l’app ?","Une invitation doit être simple à comprendre, même quand on découvre le projet.","Je réfléchis à la façon de rendre le partage d’un plan plus naturel.","Lien, WhatsApp, SMS : tu choisirais quoi ?","Tout le monde n’utilise pas les mêmes applis. Quel moyen est le plus pratique pour inviter un ami : lien, WhatsApp, SMS ou autre ?"),
(19,"Écouter les retours","Construire, c’est\naussi écouter.","Comprendre les habitudes aide à choisir les bonnes priorités.","Les retours de groupes peuvent faire évoluer les maquettes Amivoy.","Raconte un plan qui a changé au dernier moment.","Une application utile commence par les vrais besoins. Raconte-moi la dernière fois où un plan de groupe a changé au dernier moment. Qu’est-ce qui a été le plus difficile ?"),
(22,"Maquette de sortie","Une sortie,\nen un coup d’œil","Lieu, date, heure et participants : les infos clés devraient être faciles à retrouver.","Voici une piste de conception, pas la promesse que tout le parcours est déjà opérationnel.","Qu’est-ce qui devrait apparaître en premier ?","Aperçu d’une maquette Amivoy : l’objectif est de retrouver les détails essentiels sans relire toute la conversation. Qu’est-ce qui devrait apparaître en premier ?"),
(24,"Choix d’écran","Tu regardes quoi\nen premier ?","Le lieu et l’heure ? Ou qui vient ? L’ordre de l’information change l’expérience.","Je compare des façons de présenter une sortie dans Amivoy.","A : lieu et heure. B : participants. Pourquoi ?","Petit choix de conception : tu préfères voir le lieu et l’heure d’abord, ou les réponses des amis ? A ou B — dis-moi pourquoi."),
(26,"Avancement honnête","Ce qui avance.\nCe qui reste.","Amivoy est en développement : certaines parties sont des maquettes, d’autres demandent des essais.","Je préfère montrer l’état réel du projet plutôt que promettre un lancement.","Quelle étape de création veux-tu voir ?","Point d’étape honnête : Amivoy n’est pas encore lancé au public. Je partagerai l’avancement réel, maquettes et travail restant compris. Quelle étape veux-tu voir ici ?"),
(29,"Trouver un restaurant","Comment trouver\nla bonne adresse ?","Amis, carte, réseaux sociaux ou recherche web : les habitudes varient.","Amivoy explore la découverte de lieux ; les infos doivent être vérifiées.","Quelle source utilises-tu le plus ?","Quand tu arrives dans une nouvelle ville, comment trouves-tu un restaurant ? Les résultats d’une recherche doivent être vérifiés avant d’être présentés comme fiables. Quelle source utilises-tu ?"),
(31,"Carte et informations","Une épingle ne\nsuffit pas.","Avant de partir, on vérifie aussi l’adresse, les horaires et les détails pratiques.","Je réfléchis à la façon de rendre ces informations utiles dans Amivoy.","Que vérifies-tu toujours avant de partir ?","Une carte indique où se trouve un lieu, mais les détails comptent aussi. Quelle information vérifies-tu toujours avant de te déplacer ?"),
(33,"Priorités de voyage","Restaurant, activité\nou transport ?","Chaque groupe prépare son voyage dans un ordre différent.","Vos réponses aideront à comprendre quelles informations sont les plus utiles.","Quelle catégorie chercherais-tu d’abord ?","Hébergement, activité, restaurant ou transport ? Quelle information t’aiderait le plus à préparer une destination ?"),
(36,"Créer une sortie","Où ? Quand ?\nAvec qui ?","Quelques détails suffisent pour transformer une idée en rendez-vous.","Voici une maquette du parcours envisagé pour créer une sortie.","Tu ajouterais budget, activité ou autre ?","Une sortie commence par quelques questions simples. Voici une maquette Amivoy, encore en conception : quel champ ajouterais-tu — budget, activité, tenue ou autre ?"),
(38,"Présence","Qui est partant ?","« Je viens », « peut-être », « je ne peux pas » : des réponses claires évitent des relances.","Je travaille sur la façon de rendre les réponses d’un groupe faciles à lire.","Combien de temps faut-il à ton groupe pour confirmer ?","Combien de temps faut-il généralement pour savoir qui sera là ? Les réponses de présence sont un des détails que je veux rendre plus simples à suivre."),
(40,"Point de rendez-vous","« Je suis devant. »\nDevant quoi ?","Un repère clair évite les appels et les malentendus au moment de se retrouver.","L’idée : mieux préciser le lieu de rendez-vous, sans prétendre au suivi GPS.","Quel repère t’aide à retrouver tes amis ?","Devant l’entrée, près d’un commerce connu, sur une carte ou avec une description ? Quel repère t’aide le plus à retrouver tes amis ?"),
(43,"Voyage par étapes","Un voyage,\nplusieurs étapes.","Un itinéraire peut traverser plusieurs villes, pas seulement viser une destination.","Amivoy explore une organisation du voyage comme une suite d’étapes.","Quel trajet aimerais-tu faire en Afrique ?","Un voyage, ce n’est pas toujours une seule épingle sur la carte. Quel itinéraire en plusieurs étapes aimerais-tu faire en Afrique ?"),
(45,"Décider à plusieurs","Plage ou\nmontagne ?","Quand le groupe hésite, comparer les options aide à avancer.","Le vote de groupe est une piste de maquette, pas un vote en ligne actif.","Quelle décision aimerais-tu soumettre au groupe ?","Plage ou montagne ? Une ville ou plusieurs ? Quelle décision aimerais-tu pouvoir proposer au groupe ? Le vote montré dans cette maquette n’est pas encore une fonction active."),
(47,"Checklist de voyage","Le chargeur.\nLes lunettes.\nLa checklist.","Quand on part à plusieurs, on peut se répartir les choses à préparer.","Je réfléchis à une liste de préparation partagée pour les voyages.","Qu’est-ce qui est toujours oublié chez vous ?","Qui prend quoi ? Je réfléchis à une checklist de voyage en groupe. Quel objet est presque toujours oublié dans ta bande ?"),
(50,"Budget partagé","Parlons budget\navant le départ.","Une enveloppe claire aide le groupe à se mettre d’accord.","Amivoy explore le suivi des dépenses ; ce n’est pas un service de paiement.","Budget par personne ou enveloppe commune ?","Parler du budget tôt peut éviter des malentendus. Tu préfères fixer une enveloppe par personne ou un budget commun ? Exemple illustratif en FCFA."),
(52,"Souvenirs de groupe","Les photos sont\npartout ?","Après la sortie, les photos restent souvent sur plusieurs téléphones et conversations.","L’idée d’Amivoy : retrouver les souvenirs associés à un moment partagé.","Comment rassemblez-vous vos photos ?","Les photos de groupe se retrouvent dans plusieurs conversations. Comment rassemblez-vous vos souvenirs après une sortie ?"),
(54,"Carte souvenir","Une sortie à\nraconter.","Une photo, un lieu et quelques mots peuvent raconter un bon moment.","La carte montrée ici est un concept ; l’export doit être vérifié.","Story ou groupe privé ?","J’explore l’idée d’un récapitulatif partageable après une sortie. C’est un concept en cours, pas une fonction que je déclare prête. Tu le partagerais en story ou dans le groupe ?"),
(57,"Questions reçues","Vous m’avez\ndemandé…","Une question réelle peut révéler ce que je dois mieux expliquer.","Je réponds avec l’état actuel du projet, sans inventer de fonction.","Quelle question as-tu sur Amivoy ?","Vous m’avez demandé : [ajoute ici une vraie question]. Ma réponse : [réponse honnête]. Quelle autre question as-tu sur Amivoy ?"),
(59,"Expliquer Amivoy","Amivoy,\nen une phrase.","Un projet d’application pour organiser sorties et voyages, puis garder les souvenirs.","Le produit est encore en développement.","Qu’est-ce qui reste flou dans cette description ?","Amivoy est un projet pour aider les amis à découvrir des lieux, organiser des sorties et des voyages, puis garder leurs souvenirs ensemble. Qu’est-ce qui reste flou ?"),
(61,"Nommer sa sortie","Ta prochaine sortie\ns’appellerait…","Un titre drôle peut déjà donner le ton du plan.","Je cherche des idées pour les maquettes, avec des exemples fictifs.","Quel nom donnerais-tu au prochain plan ?","« Opération brunch », « On se retrouve enfin »… Quel nom donnerais-tu à la prochaine sortie de ta bande ?"),
(64,"Le parcours complet","De l’idée\nau souvenir.","Trouver une idée, choisir ensemble, se retrouver, puis garder les souvenirs.","C’est le parcours global qu’Amivoy veut rendre plus simple.","À quelle étape ça bloque le plus ?","Une sortie traverse plusieurs moments : idée, décision, rendez-vous et souvenirs. À quelle étape ton groupe perd-il le plus de temps ?"),
(66,"De destination à itinéraire","La destination\nn’est que le début.","Il faut encore choisir les villes, les activités et l’ordre des étapes.","Je travaille sur la façon de rassembler ces décisions dans Amivoy.","Quelle étape du voyage veux-tu voir ?","Comment passer d’une destination à un itinéraire de groupe ? Quelle étape aimerais-tu voir expliquée dans Amivoy ?"),
(68,"Recherche de lieux","Trouver.\nPuis vérifier.","Les horaires et les informations d’un lieu peuvent changer.","Une recherche utile doit expliquer ses sources et ses limites.","Quel lieu cherches-tu souvent près de chez toi ?","Amivoy explore la découverte de lieux. Une recherche dépend de ses sources et doit être vérifiée avant d’être présentée comme prête. Quel lieu cherches-tu souvent ?"),
(71,"Simplicité","Une app se consulte\npartout.","Dehors, en déplacement ou entre deux activités, il faut lire vite et clairement.","Je revois les textes, les contrastes et la taille des éléments.","Qu’est-ce qui rend une app facile à utiliser ?","Qu’est-ce qui rend une application agréable à utiliser ? Je continue à revoir lisibilité, contrastes et taille des éléments d’Amivoy."),
(73,"Imprévus","Le plan change.\nEt maintenant ?","Retard, météo ou lieu différent : les groupes doivent s’adapter.","Je réfléchis aux infos à retrouver rapidement quand le programme change.","Quelle info doit rester visible en premier ?","La pluie arrive, quelqu’un est en retard, le lieu change… Quelle information devrait être la plus facile à retrouver quand le plan bouge ?"),
(75,"Vie privée","Les souvenirs\nsont personnels.","Lieux, photos et conversations méritent des choix de confidentialité clairs.","Je veux réfléchir à la vie privée dès la conception du produit.","Quelle règle de confidentialité est essentielle pour toi ?","Qui voit quoi ? Quelles données sont vraiment nécessaires ? Je veux intégrer ces questions dès la conception d’Amivoy. Quelle règle compte le plus pour toi ?"),
(78,"Priorités des futurs utilisateurs","Quelle serait\nta priorité ?","Sorties, voyages, lieux ou souvenirs : tout ne peut pas passer en premier.","Vos réponses éclairent les prochaines décisions, sans promettre une date de livraison.","Choisis une priorité et dis-moi pourquoi.","Si tu choisissais la prochaine amélioration d’Amivoy : sorties, voyages, découverte ou souvenirs ? Ce sondage sert à comprendre les attentes, pas à annoncer une livraison."),
(80,"Retour utilisateur","Un retour peut\nchanger la maquette.","Un commentaire concret peut révéler une étape confuse ou inutile.","Je partagerai le retour anonymisé et la décision qui en découle.","Quel retour donnerais-tu sur cet écran ?","J’ai reçu ce retour : [ajoute un vrai retour anonymisé]. Ce que je vais réexaminer : [action réaliste]. Que penses-tu de cette maquette ?"),
(82,"Tester un prototype","Tu veux donner\nton avis ?","Les retours d’essai aident à vérifier si un parcours est compréhensible.","Je prépare les prochaines étapes ; aucun lancement n’est annoncé ici.","Écris « test » si tu veux être informé·e.","Je prépare les prochaines étapes de test d’Amivoy. Si tu veux donner ton avis sur un prototype quand il sera prêt, écris « test ». Cela ne signifie pas que l’app est déjà disponible."),
(85,"Bilan d’apprentissage","90 jours\nd’idées et d’écoute.","Les retours aident à comprendre le problème avant de choisir les fonctions.","Je partage trois apprentissages réels de la campagne.","Lequel te parle le plus ?","Après plusieurs semaines de travail, voici trois choses apprises : [ajoute trois apprentissages réels]. Laquelle te parle le plus ?"),
(87,"Prochaines priorités","La suite se\nconstruit étape par étape.","Une priorité vérifiée vaut mieux qu’une grande liste de promesses.","Je partagerai les prochaines étapes sans annoncer de date non confirmée.","Quel sujet veux-tu suivre ensuite ?","La suite du travail : [priorité choisie], puis des retours pour vérifier que le parcours est clair. Quel sujet veux-tu suivre ?"),
(89,"Merci","Merci d’avoir\nsuivi Amivoy.","Le projet continue ; il reste du travail avant de parler de lancement.","La prochaine étape doit répondre à un vrai besoin des groupes.","Quel besoin devrait passer en premier ?","Merci d’avoir suivi la création d’Amivoy pendant ces 90 jours. Le projet avance et il reste du travail. Quel besoin devrait être résolu en premier ?"),
]


def svg_text(x, y, value, size, color, weight=600, extra=""):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,Helvetica,sans-serif" font-size="{size}" font-weight="{weight}" {extra}>{escape(value)}</text>'


def wrapped(value, max_chars=25):
    lines = []
    for paragraph in value.splitlines() or [value]:
        line = ""
        for word in paragraph.split():
            if len(line) + len(word) + (1 if line else 0) > max_chars and line:
                lines.append(line); line = word
            else:
                line = f"{line} {word}".strip()
        if line: lines.append(line)
    return lines


def text_block(x, y, value, size, color, weight=700, max_chars=25, gap=1.2):
    lines = wrapped(value, max_chars)
    spans = "".join(f'<tspan x="{x}" dy="{0 if i == 0 else size*gap}">{escape(line)}</tspan>' for i, line in enumerate(lines))
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,Helvetica,sans-serif" font-size="{size}" font-weight="{weight}" letter-spacing="-1">{spans}</text>'


def base(slide_no, total, post_no, day, bg, dark=False):
    fg = CREAM if dark else GREEN
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs>
    <pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="{GREEN}" opacity=".10"/></pattern>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="{GREEN}" flood-opacity=".18"/></filter></defs>
    <rect width="1080" height="1350" fill="{bg}"/><rect width="1080" height="1350" fill="url(#grain)"/>
    <g transform="translate(64 55)"><circle cx="22" cy="22" r="22" fill="{YELLOW}"/><path d="M11 24c7-7 15-7 22 0M15 30c5-5 10-5 15 0" fill="none" stroke="{GREEN}" stroke-width="3.5" stroke-linecap="round"/><circle cx="22" cy="35" r="2.6" fill="{GREEN}"/><text x="59" y="31" fill="{fg}" font-family="Arial,Helvetica,sans-serif" font-size="31" font-weight="800">amivoy</text></g>
    {svg_text(1016,84,f'90 JOURS · POST {post_no:02d}',14,fg,800,'text-anchor="end" letter-spacing="1.5"')}
    <path d="M64 116h952" stroke="{fg}" opacity=".25"/>
    <path d="M64 1278h952" stroke="{fg}" opacity=".25"/>
    {svg_text(65,1318,f'JOUR {day}  ·  PROJET EN DÉVELOPPEMENT',13,fg,700,'letter-spacing="1.3"')}
    {svg_text(1015,1318,f'{slide_no}/{total}',14,YELLOW if dark else CORAL,900,'text-anchor="end"')}
    </svg>'''


def cover_art(post, bg):
    if post % 6 == 1:
        return f'''<circle cx="832" cy="547" r="207" fill="{CORAL if bg == GREEN else YELLOW}"/><circle cx="832" cy="547" r="176" fill="none" stroke="{YELLOW if bg == GREEN else CREAM}" stroke-width="3" stroke-dasharray="3 15"/><path d="M623 634q100-111 207-17 116-113 205-2v94H623z" fill="#628766"/><path d="M623 681q103-77 207-1 116-84 205 2v27H623z" fill="{GREEN}"/><path d="M655 679c86-77 119 30 214-36s101-45 144-14" fill="none" stroke="{YELLOW}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 15"/>'''
    if post % 6 == 2:
        return f'''<g transform="rotate(7 820 555)" filter="url(#shadow)"><rect x="662" y="395" width="325" height="325" rx="42" fill="{YELLOW}"/><rect x="698" y="431" width="253" height="112" rx="30" fill="{GREEN}"/><path d="M744 542l-14 37 52-36" fill="{GREEN}"/><circle cx="750" cy="486" r="9" fill="{CORAL}"/><circle cx="805" cy="486" r="9" fill="{CREAM}"/><circle cx="860" cy="486" r="9" fill="#82A888"/><path d="M725 608h177" stroke="{GREEN}" stroke-width="8" stroke-linecap="round"/><path d="M725 644h122" stroke="{GREEN}" stroke-width="8" stroke-linecap="round"/></g>'''
    if post % 6 == 3:
        return f'''<path d="M628 443q109-67 211 0t208 0v241q-108 61-208 0t-211 0z" fill="#E8EFE4"/><path d="M624 565c91-101 176 87 267-1s112 3 157-28" fill="none" stroke="{CORAL}" stroke-width="7" stroke-dasharray="3 16" stroke-linecap="round"/><g transform="translate(669 501)"><path d="M23 0C10 0 0 10 0 23c0 18 23 43 23 43s23-25 23-43C46 10 36 0 23 0zm0 30a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="{GREEN}"/></g><g transform="translate(886 541)"><path d="M23 0C10 0 0 10 0 23c0 18 23 43 23 43s23-25 23-43C46 10 36 0 23 0zm0 30a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="{CORAL}"/></g><circle cx="809" cy="473" r="20" fill="{YELLOW}"/>'''
    if post % 6 == 4:
        return f'''<circle cx="824" cy="553" r="194" fill="{YELLOW}"/><path d="M650 556c66-94 117-77 177-10 56-95 109-80 166 5" fill="none" stroke="{GREEN}" stroke-width="10" stroke-linecap="round"/><path d="M650 597c66-94 117-77 177-10 56-95 109-80 166 5" fill="none" stroke="{CORAL}" stroke-width="10" stroke-linecap="round"/><g transform="rotate(-10 820 685)"><rect x="683" y="650" width="278" height="72" rx="22" fill="{GREEN}"/><path d="M724 681h196" stroke="{CREAM}" stroke-width="7" stroke-linecap="round"/></g><path d="M835 420l-33 72h36l-19 54 69-83h-41l25-43z" fill="{CORAL}"/>'''
    if post % 6 == 5:
        return f'''<rect x="657" y="404" width="331" height="301" rx="28" fill="{YELLOW}" transform="rotate(8 822 554)"/><rect x="641" y="389" width="331" height="301" rx="28" fill="{CREAM}" transform="rotate(-7 806 539)"/><rect x="669" y="418" width="277" height="199" rx="14" fill="#D99A74" transform="rotate(-7 806 539)"/><circle cx="851" cy="474" r="32" fill="{YELLOW}"/><path d="M664 578q73-84 130-12 59-102 134-19v70H664z" fill="#628766" transform="rotate(-7 806 539)"/><path d="M683 631h188" stroke="{GREEN}" stroke-width="8" stroke-linecap="round" transform="rotate(-7 806 539)"/>'''
    return f'''<circle cx="822" cy="547" r="191" fill="{CORAL}"/><circle cx="822" cy="547" r="151" fill="none" stroke="{YELLOW}" stroke-width="4" stroke-dasharray="3 15"/><path d="M650 659c54-145 288-145 342 0" fill="none" stroke="{YELLOW}" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round"/>{''.join(f'<circle cx="{x}" cy="{y}" r="37" fill="{c}" stroke="{CREAM}" stroke-width="7"/>' for x,y,c in [(691,544,'#C77D63'),(779,450,'#8DAB7A'),(875,474,'#D5A943'),(942,570,'#8299AD')])}'''


def make_slide(post, index, total, day, hook, idea, angle, question, section):
    if index == 1:
        bg = GREEN if post % 3 else CORAL
        dark = True
        inner = f'''{svg_text(68,175,section.upper(),15,YELLOW,800,'letter-spacing="2.3"')}
          {cover_art(post,bg)}
          {text_block(66,332,hook,70,CREAM,900,14,1.13)}
          {svg_text(70,610,'FAIS DÉFILER  →',16,YELLOW,800,'letter-spacing="1.8"')}'''
    elif index == 2:
        bg = CREAM if post % 2 else "#E8EFE4"
        dark = False
        inner = f'''{svg_text(68,178,'UNE IDÉE À GARDER',15,CORAL,800,'letter-spacing="2.2"')}
          {text_block(68,292,idea,49,GREEN,900,28,1.17)}
          <g filter="url(#shadow)"><rect x="64" y="641" width="952" height="397" rx="34" fill="{GREEN}"/><circle cx="841" cy="840" r="131" fill="{YELLOW}"/><circle cx="841" cy="840" r="97" fill="none" stroke="{CORAL}" stroke-width="5" stroke-dasharray="4 14"/>
          {svg_text(111,724,'CE QU’EXPLORE AMIVOY',15,YELLOW,800,'letter-spacing="2"')}{text_block(111,800,angle,33,CREAM,800,27,1.2)}
          <path d="M112 972h510" stroke="{CREAM}" opacity=".25"/><circle cx="665" cy="972" r="8" fill="{CORAL}"/><circle cx="700" cy="972" r="8" fill="{YELLOW}"/><circle cx="735" cy="972" r="8" fill="#83A989"/></g>'''
    else:
        bg = "#F4E7D6" if post % 2 else GREEN
        dark = bg == GREEN
        fg = CREAM if dark else GREEN
        sub = "#DDE8DC" if dark else MUTED
        inner = f'''{svg_text(68,178,'À TOI DE NOUS DIRE',15,YELLOW if dark else CORAL,800,'letter-spacing="2.2"')}
          {text_block(68,315,question,59,fg,900,25,1.16)}
          <g transform="rotate(-3 520 775)" filter="url(#shadow)"><rect x="75" y="693" width="870" height="159" rx="28" fill="{YELLOW}"/>{text_block(120,759,'Raconte-nous en commentaire.',27,GREEN,800,35,1.2)}{svg_text(120,809,'ON LIT VOS RÉPONSES ✳',15,CORAL,800,'letter-spacing="1.7"')}</g>
          {svg_text(69,1018,'AMIVOY EST EN DÉVELOPPEMENT',16,fg,800,'letter-spacing="1.5"')}
          {svg_text(69,1060,'Les visuels de maquette sont des pistes de conception.',17,sub,500)}'''
    root = base(index, total, post, day, bg, dark)
    prefix = root[:root.index('</svg>')]
    return prefix + inner + '</svg>'


doc = ["# Amivoy — carrousels Instagram sur 90 jours", "", "**Cadence :** 3 publications par semaine, soit 39 carrousels aux jours 1, 3, 5… jusqu’au jour 89, conformément au calendrier de campagne existant. Chaque carrousel contient 3 slides (accroche, idée, question).", "", "**Note de transparence :** Amivoy est en développement. Les textes et visuels décrivent des pistes de conception lorsque la fonction n’est pas confirmée comme opérationnelle. Remplacer les champs entre crochets par des retours réels avant publication.", ""]
for post_no, (day, theme, hook, idea, angle, question, caption) in enumerate(POSTS, 1):
    week = (post_no - 1) // 3 + 1
    post_dir = OUT / f"semaine-{week:02d}" / f"post-{post_no:02d}-jour-{day}"
    post_dir.mkdir(parents=True, exist_ok=True)
    doc += [f"## Post {post_no:02d} · Jour {day} — {theme}", "", f"**Slide 1 — Accroche :** {hook.replace(chr(10), ' / ')}", f"**Slide 2 — Idée :** {idea} {angle}", f"**Slide 3 — Conversation :** {question}", f"**Légende :** {caption}", ""]
    for index in range(1, 4):
        if index == 1:
            content = make_slide(post_no, 1, 3, day, hook, idea, angle, question, theme)
        elif index == 2:
            content = make_slide(post_no, 2, 3, day, hook, idea, angle, question, theme)
        elif index == 3:
            content = make_slide(post_no, 3, 3, day, hook, idea, angle, question, theme)
        (post_dir / f"slide-{index:02d}.svg").write_text(content, encoding="utf-8")

(ROOT / "docs" / "Carrousels-Instagram-Amivoy-90-jours.md").write_text("\n".join(doc), encoding="utf-8")

# Each weekly sheet contains nine slides (three posts × three slides) for raster export.
for week in range(1, 14):
    imgs = []
    for post_no in range((week-1)*3+1, min(week*3, len(POSTS))+1):
        day = POSTS[post_no-1][0]
        folder = f"post-{post_no:02d}-jour-{day}"
        for slide_no in range(1, 4):
            slot = (post_no - (week-1)*3 - 1)*3 + slide_no - 1
            x, y = (slot % 3)*1080, (slot // 3)*1350
            imgs.append(f'<image href="{folder}/slide-{slide_no:02d}.svg" x="{x}" y="{y}" width="1080" height="1350"/>')
    height = 4050
    sheet = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="3240" height="{height}" viewBox="0 0 3240 {height}">{"".join(imgs)}</svg>'
    (OUT / f"semaine-{week:02d}" / "planche.svg").write_text(sheet, encoding="utf-8")
