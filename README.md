# Nouvelles API

API pour nouvelles : site d'information et forum.

## Utilisation

Renommer le fichier **config.env.env** en **config.env** et mettre à jour les valeurs.

### Exemple config.env

```
# Le port utilisé par l'API
PORT=5000


# L'utisateur de la base de donnée
DB_USER=postgres

# L'hôte de la base de donnée
DB_HOST=localhost

# Le nom de la base de donnée
DB_DATABASE=nouvelles

# Le mot de passe de la base de donnée
DB_PASSWORD=I9jz4p8m

# Le port de la base de donnée
DB_PORT=5432
```

## Installer les dépendances

```
npm install
```

## Executer l'API

```
# Exécuter en dévelopement
npm run dev

# Exécuter en production
npm run prod
```

## Générer la documentation

```
npm run gendoc
```

---

- Version: 0.1.0
- License: MIT
- Auteur: Raphaël Ragoomundun
