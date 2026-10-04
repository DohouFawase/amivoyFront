# Amivoy — frontend Expo

Amivoy est une maquette interactive d’application de voyages et de sorties entre amis. Elle réunit la préparation d’un voyage, les sorties locales, l’organisation du groupe, les dépenses et les souvenirs dans une interface commune.

> **État actuel : intégration partielle.** Inscription, vérification e-mail, connexion/2FA, récupération du mot de passe, profil et sécurité utilisent l’API Laravel. Les cercles, invitations et sorties utilisent aussi l’API pour leurs parcours principaux. Les voyages, notifications et certaines vues du fil restent en démonstration locale.

## Démarrer sur ordinateur

Ouvre un terminal dans le dossier `amigoApp` (à la racine du workspace, exécute `cd amigoApp`), puis installe les dépendances et lance la version navigateur :

```bash
npm install
npm run web
```

Expo affiche une adresse locale dans le terminal. Ouvre cette adresse dans ton navigateur et laisse le terminal ouvert; pour arrêter Expo, fais `Ctrl+C`. Le backend est nécessaire pour tester l’authentification, les cercles, les invitations et les sorties.

### Connecter le backend local

Dans un premier terminal, depuis `amigo` :

```bash
php artisan serve
```

Dans un second terminal, depuis `amigoApp`, passe l’URL de l’API à Expo :

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1 npm run web
```

Pour un téléphone physique, remplace `127.0.0.1` par l’adresse IP locale de l’ordinateur. Sur l’émulateur Android, utilise généralement `http://10.0.2.2:8000/api/v1`. Après inscription, le code OTP est envoyé par le backend; avec `MAIL_MAILER=log`, il apparaît dans `amigo/storage/logs/laravel.log`. Si `QUEUE_CONNECTION=database`, lance aussi `php artisan queue:work` dans un autre terminal.

Pour démarrer Expo sans ouvrir directement le navigateur :

```bash
npm start
```

Puis appuie sur `w` dans le terminal Expo pour ouvrir la version web. Pour un simulateur ou un appareil configuré, utilise `npm run ios` ou `npm run android`.

## Scénario de test dans le navigateur

1. Au premier lancement, parcours l’onboarding puis crée un compte avec une adresse e-mail accessible.
2. Récupère le code OTP dans le journal Laravel et confirme l’adresse. Après validation, tu arrives sur l’accueil connecté.
3. Ouvre **Mon profil → Mon compte**; modifie prénom, nom, téléphone, pays, langue ou intérêts et enregistre. Les changements sont envoyés à `PATCH /me`.
4. Essaie de choisir une photo de profil, puis teste le changement d’adresse e-mail avec le mot de passe actuel.
5. Dans **Sécurité**, teste le changement de mot de passe, l’activation 2FA avec code OTP et la fermeture des autres sessions.
6. Ouvre **Mon cercle d’amis**, crée un cercle, invite une adresse e-mail et partage le lien généré. Pour accepter l’invitation, connecte-toi dans l’app avec le compte destinataire et réponds depuis **Invitations reçues**.
7. Ouvre **Sorties**, crée une sortie rattachée au cercle et ajoute éventuellement un e-mail à inviter. Dans le détail, teste RSVP, arrivée, cotisation, photo/Story et, avec le compte organisateur, lancement puis clôture.
8. Déconnecte-toi et reconnecte-toi pour vérifier la session. Les voyages, notifications et certaines vues du fil restent encore en mode démo local.

Les comptes, cercles, invitations et sorties connectés sont persistés par l’API. Le backend crée un lien d’invitation qui peut être partagé depuis l’app, mais n’envoie pas lui-même les courriels. Les contributions sont un suivi de montants, pas des paiements; les voyages et notifications de l’interface restent locaux. La carte et les images distantes peuvent nécessiter une connexion Internet.

Pour lancer sur un simulateur ou un appareil configuré :

```bash
npx expo start --ios
npx expo start --android
```

Le projet utilise Expo SDK 57, React Native 0.86, Expo Router et TypeScript strict. Les dépendances installées et scripts se trouvent dans package.json; la configuration multiplateforme est dans app.json.

## Parcours présents

### Accueil et navigation

- Onboarding en quatre étapes : préférences et préremplissage du formulaire de création de compte.
- Accueil avec accès à la création d’un voyage ou d’une sortie, au fil du groupe et aux bibliothèques.
- Navigation vers l’exploration, le fil, le profil, les sorties, les voyages et les souvenirs.

### Voyages

- Création guidée d’un voyage, sélection d’amis ou d’un cercle et ajout simulé d’adresses e-mail.
- Liste des voyages, détail, itinéraire, programme, budget en FCFA, checklist, carnet, services et conseils de sécurité.
- Données de démonstration pour les destinations et activités.

### Carte et découverte

- Carte adaptée au web et au mobile, avec recherche de destinations et propositions de lieux.
- src/services/place-discovery.ts appelle les routes de recherche du backend Amigo pour les destinations et lieux proches.
- La carte web s’appuie sur OpenStreetMap. Les images distantes de démonstration nécessitent une connexion Internet.

### Recherche de lieux (backend Amigo)

La recherche de destinations et les suggestions à proximité passent par le backend Amigo. Pour utiliser Geoapify, ajoute `GEOAPIFY_API_KEY` au fichier `amigo/.env` (la clé ne doit pas être placée dans l’application mobile), puis vide le cache de configuration Laravel avec `php artisan config:clear`. Sans clé, le backend conserve son catalogue local et le fournisseur OpenStreetMap existant. La carte elle-même garde son fournisseur natif/web actuel; Geoapify sert aux destinations et aux fiches d’établissements.

### Sorties entre amis

- Création d’une sortie dans un lieu public ou privé, choix d’un cercle et de participants, date, heure et budget.
- Détail de sortie avec réponses de présence, point de rendez-vous, arrivée, lancement et clôture.
- Cotisations simulées en XOF/FCFA, calcul de la part de chacun et aperçu des remboursements.
- Ajout de photos avec la caméra ou la galerie de l’appareil, légendes et partage local vers une Story Amivoy.

#### Parcours de bout en bout

Le parcours d’écrans prévu est :

1. `/outings` affiche les sorties à venir et en cours.
2. `/create-outing` collecte le titre, le lieu, le type de lieu, la catégorie, la date, l’heure, le cercle, les participants et le budget. La carte `/map?mode=outing` peut renvoyer le lieu et ses coordonnées.
3. Après création, l’application ouvre `/outing/[id]` avec l’identifiant renvoyé par l’API.
4. Dans le détail, chaque participant répond à l’invitation et confirme son arrivée. L’organisateur peut modifier le programme et lancer la sortie.
5. Pendant la sortie, les participants suivent les cotisations, ajoutent des photos et peuvent les publier dans la Story.
6. L’organisateur clôture la sortie. Les souvenirs restent consultables et la carte `/memories/outing-card` peut être partagée.

#### Routes API à connecter

Toutes les routes ci-dessous utilisent le préfixe `/api/v1` et nécessitent `Authorization: Bearer <jeton>` ainsi que `Accept: application/json`.

| Étape | Méthode et route | Données principales |
| --- | --- | --- |
| Charger la liste | `GET /outings` | Aucune |
| Créer une sortie | `POST /outings` | `title`, `place`, `location_type`, `category`; optionnels : `date_label`, `time_label`, `note`, `activity`, `budget_target`, `circle_id`, `participant_user_ids`, `guests`, `latitude`, `longitude` |
| Charger le détail | `GET /outings/{id}` | `id` UUID de la sortie |
| Modifier le programme | `PATCH /outings/{id}` | Les champs à modifier, par exemple `place`, `date_label` ou `time_label` |
| Répondre oui/non | `POST /outings/{id}/rsvp` | `{ "attending": true }` |
| Confirmer l’arrivée | `POST /outings/{id}/check-in` | Aucune |
| Lancer la sortie | `POST /outings/{id}/start` | Aucune; organisateur uniquement |
| Ajouter une cotisation | `POST /outings/{id}/contributions` | `{ "amount": 5000 }` en XOF; participant uniquement |
| Ajouter une photo | `POST /outings/{id}/photos` | `multipart/form-data` avec `image` obligatoire et `caption` facultatif |
| Publier/retirer une photo de la Story | `PATCH /outings/{id}/photos/{photoId}/story` | Aucune; l’appel inverse l’état actuel |
| Terminer la sortie | `POST /outings/{id}/finish` | Aucune; organisateur uniquement |

Pour créer une sortie, utiliser de préférence les noms de champs snake_case de l’API. `location_type` accepte `public` ou `private`; `participant_user_ids` contient les UUID des comptes invités. `guests` ne contient que des noms et ne déclenche pas l’envoi d’invitations. Le serveur fixe actuellement la devise à XOF.

#### Ordre de branchement conseillé

1. Ajouter un client authentifié dans `src/services/` et les types de réponse d’une sortie.
2. Remplacer les données de `src/data/outings.ts` par `GET /outings`, puis connecter le formulaire à `POST /outings`.
3. Charger `/outings/{id}` à l’ouverture du détail et utiliser l’UUID serveur dans la navigation.
4. Connecter les actions RSVP, arrivée, lancement et clôture aux routes correspondantes; rafraîchir la sortie avec la réponse API.
5. Envoyer les cotisations, puis les photos en multipart et les changements de Story.
6. Ajouter les états de chargement, liste vide, erreurs réseau et accès refusé; tester le parcours avec plusieurs comptes.

À ce jour, les écrans appellent encore `src/data/outings.ts` : les changements sont locaux à la session. Les routes backend existent pour les opérations listées, mais aucun endpoint d’envoi d’invitation externe ou de programmation de rappel n’est prévu. Le bouton de rappel, les invitations affichées, les paiements et les photos de la maquette ne déclenchent donc pas ces opérations serveur; les remboursements sont calculés localement.

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
