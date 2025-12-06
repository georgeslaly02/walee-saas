# 🗄️ Configuration de la Base de Données

## 🔴 Problème Identifié

```
psycopg2.OperationalError: connection to server at "aws-1-eu-west-3.pooler.supabase.com" 
(35.181.159.10), port 5432 failed: FATAL: password authentication failed for user "postgres"
connection to server at "aws-1-eu-west-3.pooler.supabase.com" (35.181.159.10), port 5432 
failed: FATAL: SSL connection is required
```

**Causes:**
1. ❌ `DATABASE_URL` défini avec des identifiants incorrects
2. ❌ SSL non configuré pour Supabase PostgreSQL
3. ❌ Mot de passe PostgreSQL manquant ou incorrect

---

## ✅ Solutions

### **Solution 1 : Utiliser SQLite pour le Développement (RECOMMANDÉ)**

**Avantages:**
- ✅ Aucune configuration requise
- ✅ Pas de dépendances externes
- ✅ Parfait pour le développement local
- ✅ Données persistantes dans `db.sqlite3`

**Étapes:**

1. **Vérifiez que `DATABASE_URL` n'est PAS défini dans `.env`:**
```bash
# .env
# NE PAS inclure DATABASE_URL

DEBUG=True
SECRET_KEY=votre_clé_secrète
SUPABASE_URL=https://mqhmwffpbumevkhtdjnd.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon
```

2. **Relancez le serveur:**
```bash
python manage.py runserver
```

3. **Créez les migrations (première fois):**
```bash
python manage.py migrate
```

---

### **Solution 2 : Utiliser Supabase PostgreSQL (Production)**

**Prérequis:**
- Compte Supabase actif
- Accès aux identifiants PostgreSQL

**Étapes:**

#### 1️⃣ Obtenir la Connection String Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Settings → Database**
4. Copiez l'URI de connexion (ressemble à):
```
postgresql://postgres:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
```

#### 2️⃣ Mettre à jour le `.env`

```bash
# .env
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require
DEBUG=True
SUPABASE_URL=https://mqhmwffpbumevkhtdjnd.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon
```

**⚠️ IMPORTANT:** 
- Remplacez `[PASSWORD]` par le mot de passe PostgreSQL réel
- Assurez-vous que `?sslmode=require` est présent à la fin

#### 3️⃣ Configuration Django (Déjà appliquée)

Le fichier `walee/settings.py` a été mis à jour pour supporter SSL:

```python
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    # Ajouter SSL pour Supabase
    if 'supabase' in DATABASE_URL:
        DATABASES['default']['OPTIONS'] = {
            'sslmode': 'require',
        }
else:
    # Development: SQLite
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
```

#### 4️⃣ Exécuter les migrations

```bash
python manage.py migrate
```

#### 5️⃣ Relancer le serveur

```bash
python manage.py runserver
```

---

## 📊 Comparaison des Configurations

| Aspect | SQLite | PostgreSQL (Supabase) |
|--------|--------|----------------------|
| **Développement** | ✅ Recommandé | ❌ Complexe |
| **Production** | ❌ Non recommandé | ✅ Recommandé |
| **Configuration** | Aucune | Requiert identifiants |
| **Performance** | Bonne | Excellente |
| **Scalabilité** | Limitée | Illimitée |
| **Coût** | Gratuit | Gratuit (tier free) |
| **Persistance** | Fichier local | Cloud |

---

## 🔍 Vérification de la Configuration

### Vérifier la base de données utilisée

```bash
python manage.py shell
```

```python
from django.conf import settings
print(settings.DATABASES['default'])
```

**Résultat attendu pour SQLite:**
```python
{
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': '/chemin/vers/db.sqlite3'
}
```

**Résultat attendu pour PostgreSQL:**
```python
{
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': 'postgres',
    'USER': 'postgres',
    'PASSWORD': '***',
    'HOST': 'aws-1-eu-west-3.pooler.supabase.com',
    'PORT': '5432',
    'OPTIONS': {'sslmode': 'require'}
}
```

---

## 🚀 Commandes Utiles

### Créer les tables
```bash
python manage.py migrate
```

### Créer un superutilisateur
```bash
python manage.py createsuperuser
```

### Vérifier les migrations
```bash
python manage.py showmigrations
```

### Exécuter les migrations spécifiques
```bash
python manage.py migrate backend
python manage.py migrate frontend
```

### Créer une migration
```bash
python manage.py makemigrations
```

---

## 🔐 Sécurité

### ⚠️ Ne JAMAIS commiter le `.env`

Assurez-vous que `.env` est dans `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### ✅ Utiliser des variables d'environnement

Pour la production, utilisez les variables d'environnement du serveur:

**Render.com:**
```
Environment Variables → Add Variable
DATABASE_URL = postgresql://...
```

**Heroku:**
```bash
heroku config:set DATABASE_URL=postgresql://...
```

**Railway:**
```
Variables → Add Variable
DATABASE_URL = postgresql://...
```

---

## 🐛 Dépannage

### Erreur: "password authentication failed"

**Cause:** Mot de passe incorrect ou manquant

**Solution:**
1. Vérifiez le mot de passe dans Supabase
2. Assurez-vous que `[PASSWORD]` est remplacé dans `DATABASE_URL`
3. Vérifiez qu'il n'y a pas de caractères spéciaux non échappés

### Erreur: "SSL connection is required"

**Cause:** SSL non configuré

**Solution:**
1. Assurez-vous que `?sslmode=require` est dans `DATABASE_URL`
2. Vérifiez que la configuration Django inclut les OPTIONS SSL

### Erreur: "could not connect to server"

**Cause:** Serveur PostgreSQL inaccessible

**Solution:**
1. Vérifiez la connexion Internet
2. Vérifiez que l'adresse du serveur est correcte
3. Vérifiez que le port 5432 n'est pas bloqué par un pare-feu

### Erreur: "database does not exist"

**Cause:** Base de données non créée

**Solution:**
```bash
# Créer la base de données (si vous avez les permissions)
python manage.py migrate
```

---

## 📝 Résumé

| Étape | Action |
|-------|--------|
| 1 | Choisir SQLite (dev) ou PostgreSQL (prod) |
| 2 | Configurer `.env` si nécessaire |
| 3 | Vérifier `walee/settings.py` |
| 4 | Exécuter `python manage.py migrate` |
| 5 | Relancer `python manage.py runserver` |

---

## ✨ Prochaines Étapes

1. ✅ Choisir la configuration appropriée
2. ✅ Mettre à jour `.env` si nécessaire
3. ✅ Exécuter les migrations
4. ✅ Tester la connexion
5. ✅ Commencer le développement
