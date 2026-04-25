# Planity.ma — Guide de Déploiement

## 🚀 Prérequis

- Node.js 18+
- PostgreSQL 16+ avec PostGIS
- Redis (optionnel pour cache)
- Compte Resend (emails)
- Compte CMI (paiements - production uniquement)

## 📦 Installation

```bash
# Clone le repo
git clone https://github.com/Nadir-DNA/planity.ma.git
cd planity.ma

# Installe les dépendances
npm install

# Configure les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Génère le client Prisma
npx prisma generate

# Exécute les migrations
npx prisma migrate dev

# Seed la base de données (dev)
npm run db:seed

# Lance le serveur de dev
npm run dev
```

## 🔧 Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/planity_ma?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@planity.ma"

# Paiements (CMI - Production)
CMI_MERCHANT_ID="your-merchant-id"
CMI_SECRET_KEY="your-secret-key"

# SMS (Twilio/Infobip - Optionnel)
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+212xxxxx"

# Cron
CRON_SECRET="your-cron-secret"
```

## 🏗️ Build & Déploiement

### Development

```bash
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker (optionnel)

```bash
# Build l'image
docker build -t planity-ma .

# Run
docker run -p 3000:3000 --env-file .env planity-ma
```

## 📊 Base de Données

### Schema

Le schéma Prisma inclut:
- Users (CONSUMER, PRO_OWNER, PRO_STAFF, ADMIN)
- Salons (avec services, staff, opening hours)
- Bookings (avec items, payments, reviews)
- Staff (avec schedules, absences)
- Products & Stock
- Reviews & Ratings

### Migrations

```bash
# Créer une migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer en production
npx prisma migrate deploy

# Seed la base
npm run db:seed
```

## 🔌 API Endpoints

### Publiques
- `GET /api/v1/search` — Recherche de salons
- `GET /api/v1/salons` — Liste des salons
- `GET /api/v1/salons/[slug]` — Détail d'un salon
- `GET /api/v1/salons/[slug]/staff` — Équipe d'un salon

### Authentifiées
- `GET /api/v1/bookings` — Liste des réservations
- `POST /api/v1/bookings` — Créer une réservation
- `DELETE /api/v1/bookings` — Annuler une réservation
- `GET /api/v1/availability` — Disponibilités
- `POST /api/v1/reviews` — Laisser un avis

### Admin
- `POST /api/v1/reminders/run` — Envoyer les rappels (cron)

## 📱 Fonctionnalités

### Côté Client
- ✅ Recherche avancée (ville, catégorie, filtres)
- ✅ Réservation en ligne (flow 4 étapes)
- ✅ Gestion des RDV (annulation, modification)
- ✅ Favoris
- ✅ Avis et notes
- ✅ Paramètres du compte

### Côté Pro
- ✅ Onboarding wizard (4 étapes)
- ✅ Agenda (vue jour/semaine)
- ✅ Gestion des services (CRUD)
- ✅ Gestion de l'équipe (plannings, absences)
- ✅ CRM Clients
- ✅ Caisse (POS)
- ✅ Stock & Produits
- ✅ Statistiques & Rapports
- ✅ Paramètres du salon

### Admin
- ✅ Dashboard
- ✅ Gestion des salons (approuver/rejeter)
- ✅ Gestion des utilisateurs
- ✅ Modération des avis
- ✅ Statistiques plateforme

## 💳 Paiements

### CMI (Production)
- Intégration avec CMI pour les paiements par carte
- Redirect vers la page de paiement CMI
- Callback/return handling
- Vérification de la signature

### En Salon
- Espèces
- Chèque
- Virement bancaire
- Carte cadeau

## 📧 Emails

- Réservation confirmée
- Rappel 24h avant
- Rappel 1h avant
- Annulation
- Inscription pro

## 📱 SMS (Optionnel)

- Rappel 24h avant
- Rappel 1h avant
- Confirmation de RDV

## 🔒 Sécurité

- NextAuth.js v5 (JWT)
- bcrypt pour les mots de passe
- Middleware de protection des routes
- Validation des entrées (Zod)
- CSRF protection

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tous les tests
npm run test:all
```

## 📈 Monitoring

- Sentry (erreurs)
- Uptime monitoring
- Logs (console, file)
- Métriques (bookings, revenue, users)

## 🚀 Déploiement sur Vercel

```bash
# Installe le CLI
npm i -g vercel

# Déploie
vercel --prod
```

## 📝 Notes

- Le projet utilise Next.js 14 avec App Router
- Tailwind CSS v3 pour le styling
- Prisma pour l'ORM
- Resend pour les emails
- CMI pour les paiements (Maroc)
- Lucide React pour les icônes
- React Hot Toast pour les notifications

## 🤝 Contribution

1. Fork le repo
2. Crée une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'feat: ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Crée une Pull Request

## 📄 License

MIT
