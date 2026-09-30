# Amivoy — frontend Expo

Amivoy est une maquette interactive d’application de voyages et de sorties entre amis. Elle réunit la préparation d’un voyage, les sorties locales, l’organisation du groupe, les dépenses et les souvenirs dans une interface commune.

> **État actuel : frontend de démonstration.** Les profils, voyages, cercles, invitations, activités et notifications utilisent des données fictives locales. Aucune API ni aucun backend n’est appelé. Les changements vivent en mémoire pendant la session et ne sont pas synchronisés entre appareils.

## Démarrer

Depuis le dossier amigoApp :

```bash
npm install
npx expo start
```

Pour ouvrir la version web :

```bash
npx expo start --web
```

Pour lancer sur un simulateur ou un appareil configuré :

```bash
npx expo start --ios
npx expo start --android
```

Le projet utilise Expo SDK 57, React Native 0.86, Expo Router et TypeScript strict. Les dépendances installées et scripts se trouvent dans package.json; la configuration multiplateforme est dans app.json.

## Parcours présents

### Accueil et navigation

- Onboarding en quatre étapes : préférences, profil fictif et premier cercle.
- Accueil avec accès à la création d’un voyage ou d’une sortie, au fil du groupe et aux bibliothèques.
- Navigation vers l’exploration, le fil, le profil, les sorties, les voyages et les souvenirs.

### Voyages

- Création guidée d’un voyage, sélection d’amis ou d’un cercle et ajout simulé d’adresses e-mail.
- Liste des voyages, détail, itinéraire, programme, budget en FCFA, checklist, carnet, services et conseils de sécurité.
- Données de démonstration pour les destinations et activités.

### Carte et découverte

- Carte adaptée au web et au mobile, avec recherche de destinations et propositions de lieux.
- src/services/place-discovery.ts fournit actuellement des résultats locaux prédéfinis; ces propositions ne viennent pas d’un service de recherche en direct.
- La carte web s’appuie sur OpenStreetMap. Les images distantes de démonstration nécessitent une connexion Internet.

### Sorties entre amis

- Création d’une sortie dans un lieu public ou privé, choix d’un cercle et de participants, date, heure et budget.
- Détail de sortie avec réponses de présence, point de rendez-vous, arrivée, lancement et clôture.
- Cotisations simulées en XOF/FCFA, calcul de la part de chacun et aperçu des remboursements.
- Ajout de photos avec la caméra ou la galerie de l’appareil, légendes et partage local vers une Story Amivoy.

### Cercles, fil et notifications

- Création, modification des membres et suppression de cercles fictifs.
- Fil d’activité alimenté par les changements effectués dans la session.
- Écran de notifications avec exemples statiques et action « Tout lire »; les réglages associés sont des préférences de démonstration.

### Profil et sécurité

- Écrans de profil, compte, réglages et sécurité.
- Connexion et création de profil simulées. Le changement de mot de passe, la double authentification et la fermeture des autres sessions ne sont pas exécutés sur un vrai compte.

### Souvenirs

- Bibliothèque des carnets et des souvenirs de sorties, Stories locales et vue plein écran.
- Carte récapitulative d’une sortie : le web télécharge un SVG; sur mobile, le menu de partage natif est appelé avec les données de la carte. Le partage mobile d’un fichier image PNG/JPEG n’est pas encore garanti.

### Aperçu des cinq fonctions demandées

La route /demo-features montre un aperçu visuel groupé des invitations, notifications, compte/synchronisation, carte souvenir et étapes de voyage. Cette route n’est pas encore reliée à un bouton du profil ou de l’accueil. Certaines actions y affichent uniquement une confirmation de démonstration et ne modifient pas toutes les données affichées.

## Ce qui reste à faire

- **Invitations externes :** les adresses sont ajoutées à une liste de démonstration; aucun message WhatsApp, SMS ou e-mail n’est envoyé et aucune réponse réelle n’est reçue.
- **Notifications :** les rappels et annonces sont des exemples dans l’interface. Il n’y a ni notification système, ni tâche planifiée, ni alerte quand le programme change.
- **Compte et synchronisation :** il n’y a pas d’authentification réelle, de sauvegarde durable ou de synchronisation entre appareils. La plupart des données sont des variables en mémoire et se réinitialisent au redémarrage/rechargement.
- **Carte souvenir mobile :** le partage de fichier image final doit être vérifié et complété sur iOS et Android; l’export web actuel produit un SVG.
- **Voyage multi-étapes :** l’interface propose un voyage et des activités, mais la gestion complète d’étapes par ville, d’hébergements réservés et d’un itinéraire réellement partagé reste à consolider.
- **Page d’aperçu :** ajouter un accès visible à /demo-features et relier ses contrôles aux mêmes mocks que les écrans existants.
- **Données cartographiques :** la recherche et les lieux suggérés de la maquette ne garantissent ni couverture exhaustive ni horaires/tarifs à jour.

## Organisation du code

- src/app/ : écrans et routes Expo Router.
- src/app/trip/[id]/ : écrans de détail du voyage.
- src/app/outing/[id].tsx : détail d’une sortie.
- src/app/memories/ : albums, stories et carte récapitulative.
- src/components/ : composants partagés, icônes, navigation et cartes.
- src/data/ : jeux de démonstration et état local des voyages, sorties, cercles, compte et fil.
- src/services/place-discovery.ts : recherche et suggestions locales de destinations/lieux.
- assets/ : icônes, illustrations et polices.

Les composants visuels partagés et les couleurs principales sont définis dans src/components/app-ui.tsx : ivoire #FCFBF7, vert #133B2C et jaune #FFD000. Inter et Cabinet Grotesk sont utilisés pour la typographie.

## Vérifications du frontend

À exécuter depuis amigoApp :

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

Dernière vérification de cette révision : lint réussi, TypeScript réussi et Expo Doctor **21/21 contrôles** réussis.
