# Planity.ma — Roadmap Produit

> Plateforme SaaS de réservation & gestion pour les professionnels du bien-être et de la beauté au Maroc.

---

## Vue d'ensemble

| Version | Nom | Objectif |
|---------|-----|----------|
| **v0** | MVP | Valider le marché avec les fonctionnalités essentielles |
| **v1** | Growth | Fidéliser les pros et accélérer l'acquisition clients |
| **v2** | Scale | Devenir la plateforme de référence au Maroc |

---

## Cadre Réglementaire Marocain (transversal à toutes les versions)

> À intégrer dès la conception, pas en fin de projet.

| Domaine | Réglementation | Impact |
|---------|---------------|--------|
| **Paiement en ligne** | Agrément BAM requis pour détenir des fonds tiers (Loi 103-12) | Le flux d'argent va directement au pro via CMI — la plateforme ne détient pas de fonds |
| **Passerelle carte** | CMI est l'opérateur national agréé (Visa/MC au Maroc) | Convention obligatoire avec banque acquéreuse marocaine |
| **Stripe / PayPal** | Non agréés par BAM pour les marchands marocains | Interdit pour les encaissements de pros marocains |
| **Données personnelles** | Loi 09-08 (CNDP → CNIE depuis 2022) | Déclaration/autorisation CNDP, hébergement données au Maroc recommandé |
| **Facturation** | Code Général des Impôts marocain | Numérotation factures, TVA 20%, archivage 10 ans |
| **Société** | Immatriculation SARL/SA au Maroc obligatoire | Nécessaire avant tout contrat CMI |
| **Office des Changes** | Restrictions sur les flux financiers transfrontaliers | Limiter les dépendances à des processeurs étrangers |

---

## V0 — MVP (Minimum Viable Product)

> **Objectif :** Permettre à un professionnel de gérer ses réservations et d'être payé, et à un client de réserver en ligne en autonomie.

### 1. Authentification & Onboarding
- Inscription pro (email + mot de passe, ou Google/Apple OAuth)
- Inscription client (email ou téléphone)
- Onboarding guidé pour le pro (profil, services, disponibilités)
- Vérification email / SMS OTP
- Récupération de mot de passe

### 2. Profil Professionnel (Page Vitrine)
- Page publique du salon/prestataire (nom, photo, adresse, description)
- Galerie photos (avant/après, ambiance)
- Liste des services avec durée et prix
- Carte interactive (Google Maps embed)
- Lien partageable (slug personnalisé : `planity.ma/salon-name`)
- Badge "Vérifié" pour les pros validés

### 3. Gestion des Services
- Création/modification/suppression de services
- Catégories de services (coupe, coloration, soin, manucure…)
- Durée par service
- Prix fixe ou fourchette de prix
- Services actifs / inactifs

### 4. Gestion du Calendrier & Disponibilités
- Définition des horaires d'ouverture hebdomadaires (par jour)
- Jours de fermeture exceptionnels (congés, fériés)
- Vue agenda (jour / semaine) pour le pro
- Gestion des pauses (déjeuner, entre deux RDV)
- Nombre de clients simultanés par créneau (capacity)

### 5. Booking (Réservation en ligne)
- Sélection service → sélection créneau → confirmation
- Réservation instantanée (confirmation automatique) ou sur demande (confirmation manuelle par le pro)
- Récapitulatif RDV par email + SMS (client & pro)
- Rappel automatique 24h avant (email + SMS)
- Annulation & reprogrammation client (avec délai minimum configurable)
- Annulation par le pro avec notification client

### 6. Paiement

> **Contrainte réglementaire :** Stripe n'est pas disponible au Maroc. Tout prestataire de services de paiement doit être agréé par **Bank Al-Maghrib (BAM)**. La plateforme ne peut pas détenir de fonds pour le compte de tiers sans agrément d'établissement de paiement (Loi n°103-12).

#### Architecture paiement v0 — approche réaliste
- **Passerelle principale : CMI (Centre Monétique Interbancaire)**
  - Contrat d'acceptation via une banque acquéreuse marocaine (Attijariwafa, CIH, BMCE/Bank of Africa, Banque Populaire)
  - Acceptation Visa / Mastercard / CMI sur la page de réservation
  - Tokenisation carte via l'API CMI (pour rappel d'acompte sans re-saisie)
- **Paiement en salon** (cash, TPE physique) — statut mis à jour manuellement par le pro
- **Portefeuilles mobiles** (lecture seule en v0, intégration active en v1) : Orange Money Maroc, Inwi Money
- **Système d'acompte** : le pro configure un % ou montant fixe débité via CMI à la réservation, le solde réglé en salon
- **Important — flux des fonds :** l'argent est collecté directement sur le compte bancaire CMI du pro (pas de fonds en transit sur la plateforme) → évite l'obligation d'agrément BAM établissement de paiement
- Reçus automatiques par email (PDF)
- Tableau de bord des encaissements (total jour / semaine / mois)
- Remboursement via CMI (API de remboursement CMI) selon politique du pro

### 7. CRM de Base
- Liste clients avec fiche individuelle (nom, téléphone, email, historique RDV)
- Recherche et filtrage clients
- Notes internes sur un client (ex. "allergique au henné")
- Compteur de visites par client
- Dernière visite + prochain RDV

### 8. Tableau de Bord Pro
- Résumé du jour (RDV du jour, CA du jour)
- RDV à venir (liste + agenda)
- Taux de no-show
- Chiffre d'affaires (hebdo / mensuel)
- Alertes : nouveaux RDV, annulations, acomptes reçus

### 9. Notifications
- Email transactionnel (confirmation, rappel, annulation, reçu)
- SMS transactionnel (confirmation, rappel 24h)
- Notifications in-app (dashboard pro)

### 10. Administration Plateforme (Back-office)
- Gestion des comptes pros (validation, suspension)
- Gestion des litiges et remboursements
- Suivi des transactions
- Métriques globales (pros inscrits, RDV créés, CA plateforme)

### Stack Technique v0
- **Frontend :** Next.js 14 (App Router) + Tailwind CSS
- **Backend :** API Routes Next.js + Node.js
- **Base de données :** PostgreSQL (Prisma ORM)
- **Auth :** NextAuth.js
- **Paiement :** CMI (via banque acquéreuse marocaine — Attijariwafa / CIH / BMCE / BP)
- **SMS :** Avito SMS / Mobily / solution opérateur local (Twilio ne couvre pas bien le Maroc en SMS local)
- **Email :** Resend / SendGrid
- **Hébergement :** Vercel + Railway (DB) — ou hébergement local (OVH Maroc, Ozone.ma) selon contraintes données
- **Stockage :** Cloudinary (photos)

> **Note réglementaire :** Avant tout traitement de paiement, la société doit être immatriculée au Maroc (SARL/SA) et signer une convention de télépaiement avec une banque acquéreuse affiliée CMI. Prévoir 4 à 8 semaines de délai administratif.

---

## V1 — Growth

> **Objectif :** Augmenter la rétention des pros, booster la visibilité clients et introduire la monétisation SaaS.

### 1. Plans d'abonnement & Monétisation

> **Contrainte :** Sans Stripe Billing disponible au Maroc, la facturation récurrente doit être gérée manuellement ou via un partenariat bancaire. Deux approches :
> - **Prélèvement automatique CMI** (tokenisation carte, débit mensuel via API CMI)
> - **Virement bancaire manuel** avec relance automatique par email (plus simple pour démarrer)

- Freemium (1 utilisateur, max 50 RDV/mois, page basique)
- Plan Starter (fonctionnalités v0 complètes)
- Plan Pro (multi-staff, analytics avancés, priorité listing)
- Plan Business (multi-sites, API, white-label partiel)
- Gestion des abonnements (upgrade, downgrade, annulation)
- Facturation mensuelle/annuelle : débit CMI ou virement + facture PDF automatique
- Numéros de facture conformes à la législation marocaine (DGI)

### 2. Multi-Staff (Équipe)
- Ajout de collaborateurs (coiffeurs, esthéticiennes…) au sein d'un salon
- Agenda individuel par membre de l'équipe
- Attribution d'un service à un ou plusieurs membres
- Le client choisit le prestataire ou "peu importe"
- Permissions par rôle (admin, staff, receptionist)

### 3. CRM Avancé
- Tags clients personnalisés (VIP, fidèle, problématique…)
- Historique complet : RDV, dépenses, services consommés
- Fiche client enrichie : anniversaire, préférences, allergies, formules habituelles
- Segmentation clients (ex. "clients actifs ce mois-ci", "clients perdus depuis 3 mois")
- Export CSV de la base clients

### 4. Marketing & Fidélisation
- **Programme de fidélité :** points par visite, échangeables contre remises
- **Campagnes SMS/email :** envoi de promotions ciblées aux segments clients
- **Codes promo :** création de coupons (% ou montant fixe, usage limité)
- **Rappels de retour :** "Ça fait 6 semaines, pensez à vous recoiffer !"
- Parrainage client (lien de parrainage, crédit offert)

### 5. Marketplace & Découverte
- Moteur de recherche (ville, catégorie, service, disponibilité)
- Filtres avancés (prix, note, distance, disponible aujourd'hui)
- Géolocalisation client (salons à proximité)
- Mise en avant payante (boost listing)
- Page catégorie (ex. tous les coiffeurs à Casablanca)

### 6. Avis & Notations
- Demande d'avis automatique post-RDV (email + SMS)
- Note de 1 à 5 étoiles + commentaire
- Réponse publique du pro aux avis
- Modération des avis (signalement)
- Score global affiché sur la page vitrine

### 7. Application Mobile (PWA)
- Progressive Web App (installable sur iOS & Android)
- Interface client optimisée mobile
- Interface pro optimisée mobile (agenda, RDV du jour)
- Notifications push (nouveau RDV, rappel)

### 8. Caisse & Comptabilité Légère
- Ajout de ventes annexes (produits, pourboires)
- Tickets de caisse numériques
- Clôture de journée (récapitulatif CA)
- Export comptable (CSV / PDF mensuel)
- TVA : gestion avec/sans TVA par service

### 9. Gestion des Ressources
- Gestion des cabines / espaces (éviter les conflits de ressources)
- Equipements associés à un service (ex. laser = appareil X)
- Planning ressources dans l'agenda

### 10. Intégrations
- Google Calendar sync (bi-directionnel)
- Widget de réservation embeddable (iFrame / JS snippet) pour site externe
- WhatsApp Business API (confirmation & rappel via WhatsApp)
- Meta Pixel & Google Analytics 4

---

## V2 — Scale

> **Objectif :** Dominer le marché marocain et préparer l'expansion régionale avec une plateforme enterprise-grade.

### 1. Intelligence Artificielle & Automatisation
- **Suggestions intelligentes :** "Vos clients qui n'ont pas réservé depuis X semaines"
- **Prédiction no-show :** score de risque par client, proposition d'overbooking maîtrisé
- **Optimisation agenda IA :** remplissage automatique des créneaux vides via relances ciblées
- **Chatbot de réservation IA :** bot WhatsApp/Instagram capable de prendre un RDV en conversation
- Analyse sentimentale des avis
- Recommandations de services personnalisées pour chaque client

### 2. Application Mobile Native (iOS & Android)
- App native React Native / Expo
- Interface pro complète (agenda, caisse, CRM, notifications push)
- Interface client complète (réservation, suivi, fidélité, wallet)
- Mode hors-ligne pour le pro (consultation agenda sans connexion)
- Biométrie (Face ID, empreinte)

### 3. Marketplace Avancée & SEO
- Pages SEO optimisées par ville / quartier / service
- Blog intégré (conseils beauté, tendances)
- Comparateur de salons
- Réservation express (1 clic si carte enregistrée)
- Last-minute deals (créneaux disponibles dans les 24h à prix réduit)

### 4. Multi-Sites & Franchises
- Gestion de plusieurs établissements sous une même enseigne
- Dashboard consolidé multi-sites
- Rapports comparatifs entre établissements
- Partage de la base clients entre sites
- Tarification et équipes par site

### 5. Finance & Paiements Avancés

> **Contrainte BAM :** Pour détenir et redistribuer des fonds (modèle marketplace), la plateforme devra obtenir l'**agrément d'établissement de paiement** auprès de Bank Al-Maghrib (Loi 103-12 relative aux établissements de crédit). Ce processus est long et coûteux → à prévoir juridiquement en amont de la v2.

- **Wallet pro virtuel :** tableau de suivi des encaissements et acomptes (comptabilité, pas détention de fonds réels)
- **Payout via virement bancaire** : le pro renseigne son RIB, la plateforme initie des virements via API bancaire partenaire (Bank of Africa, CIH Bank Open Banking)
- **Paiement fractionné client** : partenariat avec **Hmizate / Cashplus BNPL** ou solution locale
- **Mobile money :** Orange Money Maroc, Inwi Money, Wafacash (API officielle partenaire)
- **CIH Pay / Barid Bank** comme alternative CMI pour les clients sans CB
- Facturation automatique avec numérotation légale marocaine (conformité DGI)
- Rapports financiers avancés (P&L mensuel, prévisions CA)
- **Gestion TVA 20%** automatisée (services soumis à TVA au Maroc)

### 6. Packages & Abonnements Clients
- **Packs de séances :** ex. "10 épilations = 8 payées"
- **Abonnements récurrents client :** ex. "coupe mensuelle 150 DH/mois"
- Suivi du solde de séances par client
- Renouvellement automatique

### 7. Téléconsultation & Services Hybrides
- Consultations en visio (esthétique, conseil maquillage, trichologie)
- Prise en charge paiement visio
- Partage de fichiers (avant/après, ordonnances)

### 8. API & Écosystème
- API REST publique documentée (Swagger)
- Webhooks configurables (new_booking, payment_received…)
- SDK JavaScript & PHP
- Marketplace d'applications tierces (partenaires)
- White-label complet (la plateforme sous la marque d'un partenaire)

### 9. Analytics & Reporting Avancés
- Dashboard analytics temps réel
- Rapports personnalisables (drag & drop)
- Benchmarking anonymisé (comparaison avec salons similaires)
- Funnel de conversion réservation
- Heatmap des créneaux les plus demandés
- Prévisions de CA basées sur l'historique

### 10. Conformité & Sécurité Enterprise
- RGPD / Loi 09-08 Maroc (droit à l'oubli, export données)
- Audit logs complets
- SSO (Single Sign-On) pour les groupes
- 2FA obligatoire pour les admins
- Sauvegardes quotidiennes chiffrées
- SLA 99.9% uptime garanti

### 11. Expansion Régionale
- Multi-langue (Arabe, Français, Darija, Anglais)
- Multi-devise (MAD, EUR)
- Adaptation légale par pays (Algérie, Tunisie, Sénégal…)
- Portail partenaires / revendeurs locaux

---

## Priorités & Timeline Indicative

```
Q2 2026 ──── V0 MVP ────────► Lancement bêta fermée (50 pros pilotes)
Q3 2026 ──── V0 stable ──────► Lancement public + acquisition
Q1 2027 ──── V1 Growth ──────► Monétisation + marketplace
Q3 2027 ──── V2 Scale ───────► IA + mobile natif + expansion
```

---

## Métriques de Succès

| Version | KPIs cibles |
|---------|-------------|
| v0 | 100 pros actifs, 1 000 RDV/mois, NPS > 50 |
| v1 | 500 pros, 15 000 RDV/mois, MRR 50k DH, taux rétention > 70% |
| v2 | 3 000 pros, 150 000 RDV/mois, MRR 500k DH, 3 pays |
