# Planity.ma — Plan de Réplique Complète

## Contexte

**Objectif** : Construire une réplique complète de Planity.com adaptée au Maroc (Planity.ma) — une marketplace de réservation beauté/bien-être avec un dashboard professionnel intégré.

**Problème résolu** : Le marché marocain manque d'une plateforme centralisée de réservation beauté/bien-être. Planity.ma offrira aux consommateurs la découverte et réservation en ligne 24/7, et aux professionnels un outil complet de gestion (agenda, caisse, CRM, marketing).

**État actuel** : Le dépôt est vide (git init uniquement). Tout est à construire from scratch.

---

## Stack Technique

| Couche | Technologie | Justification |
|--------|------------|---------------|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG pour SEO, Server Actions, routing imbriqué |
| Langage | **TypeScript** | Sécurité des types, autocomplétion, documentation vivante |
| Base de données | **PostgreSQL 16 + PostGIS** | Relationnel, recherche full-text, requêtes géospatiales |
| ORM | **Prisma** | Migrations typées, génération de types automatique |
| Auth | **NextAuth.js v5** | Multi-provider (email, Google, Facebook, téléphone OTP) |
| Styling | **Tailwind CSS** | Développement rapide, support RTL, design system cohérent |
| Composants UI | **Radix UI + composants custom** | Accessibilité native, flexibilité design |
| État client | **Zustand** + **TanStack Query** | État léger + cache serveur avec invalidation |
| Formulaires | **React Hook Form + Zod** | Validation partagée client/serveur |
| Paiements | **CMI (Centre Monétique Interbancaire)** | Paiements marketplace, dépôts, remboursements |
| | **Espèces** | Paiement en salon |
| | **Chèque** | Paiement en salon |
| | **Virement bancaire** | Paiement en salon |
| Cache/Temps réel | **Redis** | Cache slots, sessions, pub/sub temps réel |
| Stockage fichiers | **AWS S3 / Cloudflare R2** | Photos salons, avatars, reçus |
| Email | **Resend** | Emails transactionnels (confirmations, rappels) |
| SMS | **Twilio / Infobip** | Rappels RDV, OTP, campagnes marketing |
| Temps réel | **Socket.io** | Agenda Pro en temps réel, notifications live |
| Maps | **Google Maps Platform** | Cartes, geocoding, autocomplete adresses |
| Tests | **Vitest + Playwright** | Tests unitaires/intégration + E2E |
| CI/CD | **GitHub Actions** | Lint, typecheck, test, déploiement |
| Hébergement | **Vercel** (initial) | Déploiement Next.js zero-config |
| Dev local | **Docker Compose** | PostgreSQL, Redis, MinIO (S3-compatible) |
| Mobile | **PWA** (Phase 1) → **React Native** (Phase 2) | Rapidité de mise en marché puis apps natives |

---

## Structure du Projet

```
planity-ma/
├── prisma/
│   ├── schema.prisma              # Schéma BDD complet
│   ├── migrations/
│   └── seed.ts                    # Données initiales (villes, catégories)
├── public/
│   ├── locales/{fr,ar}/           # Traductions
│   └── manifest.json              # PWA
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Pages publiques (accueil, à propos)
│   │   ├── (marketplace)/         # Côté consommateur
│   │   │   ├── recherche/         # Résultats de recherche
│   │   │   ├── [city]/[category]/ # Pages SEO ville/catégorie
│   │   │   ├── etablissement/[slug]/ # Profil salon
│   │   │   ├── reservation/[salonId]/ # Flow réservation
│   │   │   └── carte-cadeau/
│   │   ├── (auth)/                # Connexion, inscription
│   │   ├── (account)/             # Espace client (RDV, favoris, fidélité)
│   │   ├── pro/                   # Dashboard professionnel
│   │   │   ├── (onboarding)/      # Inscription salon
│   │   │   └── (dashboard)/       # Agenda, clients, services, caisse, etc.
│   │   ├── admin/                 # Panel administration plateforme
│   │   └── api/v1/               # Routes API REST
│   ├── components/
│   │   ├── ui/                    # Composants primitifs (Button, Input, Dialog...)
│   │   ├── marketplace/           # Cards salon, filtres, recherche
│   │   ├── booking/               # Flow réservation
│   │   ├── pro/                   # Composants dashboard Pro
│   │   └── shared/                # Header, Footer, Navigation
│   ├── lib/                       # Clients et utilitaires
│   │   ├── db.ts, auth.ts, stripe.ts, redis.ts
│   │   ├── availability.ts        # Moteur de calcul des créneaux
│   │   ├── search.ts, geo.ts, sms.ts, email.ts
│   │   └── utils.ts
│   ├── server/
│   │   ├── actions/               # Server Actions Next.js
│   │   ├── services/              # Logique métier (booking, payment, notification...)
│   │   └── validators/            # Schémas Zod
│   ├── hooks/                     # Hooks React custom
│   ├── stores/                    # Stores Zustand
│   ├── types/                     # Types TypeScript
│   └── i18n/                      # Configuration internationalisation
├── tests/{unit,integration,e2e}/
├── docker/docker-compose.yml
└── Configuration (package.json, tsconfig, tailwind.config, .env.example)
```

---

## Schéma Base de Données — Modèles Clés

| Modèle | Description | Relations principales |
|--------|-------------|----------------------|
| **User** | Utilisateur (consommateur, pro, admin) | → Bookings, Reviews, Favorites, LoyaltyCards, OwnedSalons |
| **Salon** | Établissement (salon, spa, barbier) | → Owner(User), Services, Staff, Reviews, Bookings, Products |
| **Service** | Prestation proposée | → Salon, ServiceCategory, StaffMembers (M2M), BookingItems |
| **ServiceCategory** | Catégories hiérarchiques | Auto-référencé (parent/enfant) |
| **StaffMember** | Membre de l'équipe | → User, Salon, Schedules, Absences, Bookings |
| **StaffSchedule** | Horaires hebdomadaires par staff | → StaffMember |
| **StaffAbsence** | Congés, maladie, formation | → StaffMember |
| **OpeningHours** | Horaires d'ouverture du salon | → Salon |
| **Booking** | Réservation client | → User, Salon, BookingItems, Payment, Review |
| **BookingItem** | Service individuel dans une réservation | → Booking, Service, StaffMember |
| **Review** | Avis post-RDV (4 critères + commentaire) | → Booking, User, Salon |
| **Payment** | Transaction financière | → Booking, Salon, User |
| **GiftCard** | Carte cadeau | → Salon, User (acheteur), UsageHistory |
| **Product** | Article en stock (vente) | → Salon, Supplier |
| **Notification** | Email/SMS/Push | → User |
| **MarketingCampaign** | Campagne SMS/Email | → Salon |
| **LoyaltyCard** | Carte de fidélité | → User, Salon |
| **ClockEvent** | Pointage horaire (entrée/sortie) | → StaffMember |

**Index critiques** :
- GiST sur `(latitude, longitude)` pour requêtes géo
- GIN sur `tsvector(name, description, city)` pour recherche full-text
- Composite sur `(salonId, staffId, startTime)` pour disponibilités
- Index sur `(userId, status)` pour historique RDV

---

## Phases d'Implémentation

### Phase 1 : Fondations (Semaines 1-4)

**Sprint 1 (S1-S2) — Setup & Infrastructure**
- [ ] Init Next.js 14 + TypeScript + Tailwind CSS + ESLint/Prettier
- [ ] Docker Compose (PostgreSQL+PostGIS, Redis, MinIO)
- [ ] Schéma Prisma complet (tous les modèles ci-dessus)
- [ ] Migration initiale + seed (villes marocaines, catégories)
- [ ] Configuration NextAuth.js (email/password)
- [ ] Bibliothèque composants UI de base (Button, Input, Card, Dialog, Calendar)
- [ ] Layout racine avec header/footer
- [ ] Pipeline CI GitHub Actions

**Sprint 2 (S3-S4) — Homepage + Profils Salons**
- [ ] Page d'accueil : hero, barre de recherche, grille catégories, salons vedettes
- [ ] Page profil salon : galerie photos, services, équipe, horaires, carte, avis
- [ ] Page recherche : full-text PostgreSQL, filtres ville/catégorie
- [ ] Vue liste avec cards salon
- [ ] SEO : meta tags, OpenGraph, JSON-LD
- [ ] Design responsive complet
- [ ] Setup i18n (français par défaut)

### Phase 2 : Moteur de Réservation (Semaines 5-8)

**Sprint 3 (S5-S6) — Disponibilités & Flow Réservation**
- [ ] Moteur de calcul des créneaux (`availability.ts`) : intersection horaires staff × horaires salon − réservations − absences
- [ ] Cache Redis des créneaux avec invalidation
- [ ] Flow réservation : sélection service → staff → date → créneau → confirmation
- [ ] Réservation multi-services
- [ ] Verrouillage optimiste (empêcher double réservation)
- [ ] Email de confirmation (Resend)

**Sprint 4 (S7-S8) — Comptes Utilisateurs & Gestion RDV**
- [ ] Inscription/connexion (email, Google OAuth, OTP téléphone)
- [ ] Espace client : RDV à venir, historique, favoris, paramètres
- [ ] Modification/annulation de réservation
- [ ] Rappels SMS automatiques (24h et 1h avant)
- [ ] Mises à jour temps réel des disponibilités (Socket.io)

### Phase 3 : Dashboard Pro MVP (Semaines 9-14)

**Sprint 5 (S9-S10) — Inscription Pro & Agenda**
- [ ] Wizard d'onboarding salon (infos, horaires, services, équipe)
- [ ] Layout dashboard Pro (sidebar, header, sélecteur salon)
- [ ] Agenda/Calendrier : vue jour/semaine, colonnes par staff, blocs colorés
- [ ] Création RDV walk-in depuis l'agenda
- [ ] Sync temps réel (nouveau RDV online → apparaît instantanément)

**Sprint 6 (S11-S12) — CRM Clients & Gestion Services/Équipe**
- [ ] Base de données clients : liste, recherche, fiches détaillées, historique, notes
- [ ] CRUD services : création, prix, durée, assignation staff, catégories
- [ ] Gestion équipe : ajout/suppression, plannings individuels, absences

**Sprint 7 (S13-S14) — Avis & Recherche Avancée**
- [ ] Système d'avis : demande automatique post-RDV, 4 critères de notation
- [ ] Affichage avis sur profil salon, réponse du salon
- [ ] Modération des avis (admin)
- [ ] Vue carte (Google Maps) avec marqueurs
- [ ] Recherche géolocalisée (PostGIS nearest-neighbor)
- [ ] Filtres avancés : prix, note, disponibilité, distance
- [ ] Pages SEO par ville/catégorie

### Phase 4 : Paiements & Caisse (Semaines 15-18)

**Sprint 8 (S15-S16) — Paiements en Ligne**
- [ ] Onboarding Stripe Connect pour salons
- [ ] Collecte de dépôt/acompte à la réservation
- [ ] Prépaiement complet
- [ ] Webhooks Stripe (succès, échec, remboursement)
- [ ] Flow de remboursement (annulations dans les règles)
- [ ] Historique des transactions pour le salon

**Sprint 9 (S17-S18) — Caisse Enregistreuse (POS)**
- [ ] Interface POS : sélection client, ajout services/produits
- [ ] Méthodes de paiement multiples (carte, espèces, chèque, mixte)
- [ ] Application réductions / cartes cadeaux
- [ ] Reçu digital (envoi SMS/email)
- [ ] Rapport de clôture journalière (rapport Z)
- [ ] Rapports financiers mensuels, export CSV/PDF

### Phase 5 : Fonctionnalités Pro Avancées (Semaines 19-24)

**Sprint 10 (S19-S20) — Inventaire & Cartes Cadeaux**
- [ ] Catalogue produits CRUD, suivi stock, alertes stock bas
- [ ] Scan code-barres (caméra mobile)
- [ ] Gestion fournisseurs
- [ ] Création/achat/utilisation cartes cadeaux

**Sprint 11 (S21-S22) — Marketing & Fidélité**
- [ ] Builder campagnes SMS : segmentation clients, templates, envoi programmé
- [ ] Campagnes email
- [ ] Programme de fidélité : points par euro, paliers, échange
- [ ] Codes promo / réductions

**Sprint 12 (S23-S24) — Analytiques & Rapports**
- [ ] Dashboard revenus (jour/semaine/mois, par service, par staff)
- [ ] Taux d'occupation (heures réservées vs disponibles, heatmap)
- [ ] Analytiques clients (nouveaux vs récurrents, rétention)
- [ ] Performance staff (revenu, nombre RDV, satisfaction)
- [ ] Export rapports PDF/CSV

### Phase 6 : Maturité Plateforme (Semaines 25-30)

**Sprint 13 (S25-S26) — Admin & Multi-établissements**
- [ ] Panel admin : KPIs plateforme, gestion salons, gestion utilisateurs
- [ ] Modération des avis
- [ ] Gestion contenu (catégories, homepage, blog)
- [ ] Support multi-établissements (un propriétaire, plusieurs lieux)

**Sprint 14 (S27-S28) — Website Builder & Boutique en Ligne**
- [ ] Constructeur de micro-site salon (thèmes, sections, booking widget intégré)
- [ ] Boutique produits en ligne (catalogue, panier, checkout, livraison/retrait)

**Sprint 15 (S29-S30) — Mobile, i18n, Performance**
- [ ] PWA : service worker, install prompt, push notifications
- [ ] Support arabe RTL complet
- [ ] Optimisation performance (Core Web Vitals)
- [ ] Pointage horaire staff (clock in/out)

### Phase 7 : Préparation au Lancement (Semaines 31-32)

- [ ] Tests de charge (k6)
- [ ] Audit sécurité (OWASP Top 10)
- [ ] Conformité RGPD / données personnelles
- [ ] Suite de tests E2E Playwright (flows critiques)
- [ ] Infrastructure production
- [ ] Monitoring (Sentry, uptime)
- [ ] Documentation (API, guides utilisateur)
- [ ] Lancement beta avec 5-10 salons partenaires à Casablanca

---

## Décisions Architecturales Clés

1. **Monorepo Next.js** (frontend + API co-localisés) — simplicité de déploiement, extraction possible plus tard
2. **PostgreSQL full-text search** au lieu d'Elasticsearch — suffisant jusqu'à 10 000+ salons, économise coûts et complexité
3. **Calcul disponibilités à la demande + cache Redis** — plus simple que pré-calcul, invalidation immédiate sur changement
4. **Socket.io pour Pro** / SSE pour consommateurs — bidirectionnel pour l'agenda, léger pour les clients
5. **Stripe Connect Express** — KYC géré par Stripe, fallback vers virements bancaires si non supporté au Maroc
6. **PWA d'abord**, React Native ensuite — time-to-market rapide, apps natives quand justifié
7. **Multi-tenant avec `salonId`** — base partagée avec isolation par colonne, couche d'accès centralisée

---

## Vérification & Tests

Pour valider l'implémentation à chaque phase :

1. **Tests unitaires** (Vitest) : moteur de disponibilités, logique métier réservation, calculs financiers
2. **Tests d'intégration** : API routes, Server Actions avec base de test
3. **Tests E2E** (Playwright) : flow complet réservation consommateur, onboarding Pro, création RDV depuis agenda
4. **Tests manuels** :
   - Parcours consommateur : recherche → salon → réservation → confirmation email/SMS
   - Parcours Pro : inscription → configuration → agenda → RDV walk-in → caisse → rapports
   - Parcours Admin : modération avis, gestion salons
5. **Performance** : Core Web Vitals < seuils (LCP < 2.5s, FID < 100ms, CLS < 0.1)
6. **Mobile** : test sur appareils réels (responsive + PWA install)
