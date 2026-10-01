# Endpoints backend non consommés par le frontend

Inventaire statique des routes Laravel enregistrées comparées aux appels HTTP trouvés dans `amigoApp/services/*.ts`. Les chemins sont relatifs au préfixe `/api/v1`. Une route est listée si aucune méthode HTTP équivalente n’a été trouvée côté frontend. Les endpoints déclarés dans un service mais jamais appelés par un écran peuvent donc aussi apparaître comme intégrés ici.

Routes non consommées détectées : **5** sur 258 routes enregistrées.

- `GET|HEAD /api/v1/subscriptions`
- `POST /api/v1/subscriptions`
- `GET|HEAD /api/v1/subscriptions/{id}`
- `PUT|PATCH /api/v1/subscriptions/{id}`
- `DELETE /api/v1/subscriptions/{id}`
