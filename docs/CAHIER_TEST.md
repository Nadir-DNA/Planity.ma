# Cahier de Test — Planity.ma

**Version:** 1.0
**Date:** 25 avril 2026
**Scope:** Tests fonctionnels parcours User & Pro

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Parcours USER (Client)](#parcours-user)
3. [Parcours PRO (Salon)](#parcours-pro)
4. [Scénarios Edge Cases](#edge-cases)
5. [Checklist Go-Live](#go-live)

---

## Introduction

### Objectifs
Valider toutes les fonctionnalités critiques avant mise en production :
- **User:** Recherche → Réservation → Gestion RDV
- **Pro:** Inscription → Agenda → Caisse → CRM

### Environnement de test
| Élément | Valeur |
|---------|--------|
| URL dev | `http://localhost:3000` |
| DB | PostgreSQL local (seeded) |
| Comptes test | 1 admin, 2 pro, 3 clients |

---

## Parcours USER

### US-01: Inscription Client

| ID | US-01 |
|----|-------|
| **Précondition** | User non authentifié |
| **URL** | `/inscription` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Accéder `/inscription` | Form affiché (nom, email, password, phone) | ⬜ |
| 2 | Remplir champs valides | Validation OK | ⬜ |
| 3 | Cliquer "Créer compte" | Toast succès, redirection `/mes-rendez-vous` | ⬜ |
| 4 | Email déjà existant | Message "Compte existant" | ⬜ |
| 5 | Password < 8 chars | Erreur validation "Min 8 caractères" | ⬜ |
| 6 | Email invalide | Erreur "Email invalide" | ⬜ |
| 7 | Phone format incorrect | Erreur "Format +212 6XX-XXXXXX" | ⬜ |
| 8 | Google OAuth click | Popup Google, puis connexion réussie | ⬜ |

---

### US-02: Connexion Client

| ID | US-02 |
|----|-------|
| **Précondition** | Compte existant |
| **URL** | `/connexion` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Email + password corrects | Connexion OK, redirection `/mes-rendez-vous` | ⬜ |
| 2 | Password incorrect | Erreur "Identifiants invalides" | ⬜ |
| 3 | Email inexistant | Erreur "Compte non trouvé" | ⬜ |
| 4 | "Se connecter avec Google" | OAuth flow, redirection OK | ⬜ |
| 5 | Déconnexion | Session cleared, redirection `/` | ⬜ |
| 6 | Session persistante | Revenir après 24h → encore connecté | ⬜ |

---

### US-03: Recherche Salon

| ID | US-03 |
|----|-------|
| **Précondition** | Page d'accueil ou `/recherche` |
| **URL** | `/`, `/recherche` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Recherche vide "Casablanca" | Liste salons Casablanca affichée | ⬜ |
| 2 | Filtrer "Coiffeur" | Seuls coiffeurs affichés | ⬜ |
| 3 | Recherche "Barbier Rabat" | Résultats Rabat, catégorie Barbier | ⬜ |
| 4 | Trier par "Note" | Salons meilleurs notes en premier | ⬜ |
| 5 | Trier par "Prix" | Prix croissant/decroissant | ⬜ |
| 6 | Pagination scroll | Nouveaux résultats chargés | ⬜ |
| 7 | Click salon card | Redirection `/etablissement/[slug]` | ⬜ |
| 8 | Recherche géolocalisée | Salons proches (si GPS activé) | ⬜ |
| 9 | URL SEO `/casablanca/coiffeur` | Page SSG avec meta title/desc corrects | ⬜ |

---

### US-04: Page Salon (Fiche)

| ID | US-04 |
|----|-------|
| **Précondition** | Salon existant |
| **URL** | `/etablissement/[slug]` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher page | Nom, adresse, photos, services, équipe | ⬜ |
| 2 | Section avis | Liste avis avec note, pagination | ⬜ |
| 3 | Bouton "Réserver" | Ouverture modal réservation | ⬜ |
| 4 | Bouton "Ajouter favoris" | Favori ajouté, icône filled | ⬜ |
| 5 | Retirer favori | Icône unfilled, toast confirm | ⬜ |
| 6 | Afficher horaires | Grille horaires semaine | ⬜ |
| 7 | Click "Voir sur Maps" | Ouverture Google Maps | ⬜ |
| 8 | Salon inactif | Badge "Fermé", réservation désactivée | ⬜ |
| 9 | Partager salon | Copy link / social share | ⬜ |

---

### US-05: Réservation (Flow complet)

| ID | US-05 |
|----|-------|
| **Précondition** | User authentifié, salon actif |
| **URL** | `/reservation/[salonId]` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Sélectionner service | Prix et durée affichés | ⬜ |
| 2 | Sélectionner membre équipe | Calendrier affiché | ⬜ |
| 3 | Sélectionner date | Créneaux disponibles pour ce jour | ⬜ |
| 4 | Sélectionner créneau | Créneau validé, disabled si occupé | ⬜ |
| 5 | Jour sans créneaux | Message "Pas de disponibilité" | ⬜ |
| 6 | Récapitulatif | Service, staff, date, heure, prix | ⬜ |
| 7 | Ajouter note/commentaire | Champ textarea | ⬜ |
| 8 | Confirmer réservation | Toast succès, email confirmation | ⬜ |
| 9 | Réservation sans compte | Modal connexion/inscription | ⬜ |
| 10 | Paiement en ligne (si activé) | Stripe checkout, puis confirmation | ⬜ |
| 11 | Annuler avant confirmation | Retour sans réservation | ⬜ |

---

### US-06: Mes Rendez-vous

| ID | US-06 |
|----|-------|
| **Précondition** | User authentifié avec RDV |
| **URL** | `/mes-rendez-vous` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher liste | RDV futurs + historique | ⬜ |
| 2 | Filtrer "À venir" | Seuls RDV non passés | ⬜ |
| 3 | Filtrer "Passés" | Historique uniquement | ⬜ |
| 4 | Annuler RDV | Modal confirmation → RDV annulé | ⬜ |
| 5 | Modifier RDV | Retour flow réservation avec pré-selection | ⬜ |
| 6 | RDV annulé par salon | Badge "Annulé", notification | ⬜ |
| 7 | Rappel SMS/email | Reçu 24h avant RDV | ⬜ |
| 8 | Click salon | Redirection fiche salon | ⬜ |

---

### US-07: Favoris

| ID | US-07 |
|----|-------|
| **Précondition** | User authentifié |
| **URL** | `/favoris` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher favoris | Liste salons favoris | ⬜ |
| 2 | Retirer favori | Confirmation, retiré de liste | ⬜ |
| 3 | Favoris vide | Message "Aucun favori" | ⬜ |
| 4 | Click salon | Redirection fiche | ⬜ |
| 5 | Réserver depuis favori | Flow réservation directe | ⬜ |

---

### US-08: Paramètres Client

| ID | US-08 |
|----|-------|
| **Précondition** | User authentifié |
| **URL** | `/parametres` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Modifier nom/email | Sauvegarde OK | ⬜ |
| 2 | Changer password | Email confirmation envoyé | ⬜ |
| 3 | Notifications toggle | Préférences sauvegardées | ⬜ |
| 4 | Supprimer compte | Confirmation, compte deleted | ⬜ |
| 5 | Langue FR/AR | Interface traduite | ⬜ |

---

### US-09: Laisser un Avis

| ID | US-09 |
|----|-------|
| **Précondition** | User avec RDV passé |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Click "Laisser avis" | Modal rating + commentaire | ⬜ |
| 2 | Sélectionner 1-5 étoiles | Rating visuel | ⬜ |
| 3 | Écrire commentaire | Validation min 10 chars | ⬜ |
| 4 | Envoyer avis | Toast succès, avis publié | ⬜ |
| 5 | Avis déjà existant | Message "Avis déjà donné" | ⬜ |
| 6 | Avis sans RDV | Accès bloqué | ⬜ |

---

## Parcours PRO

### PR-01: Inscription Professionnel

| ID | PR-01 |
|----|-------|
| **Précondition** | User non Pro |
| **URL** | `/pro/inscription` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher formulaire multi-step | Step 1: Infos personnel | ⬜ |
| 2 | Remplir infos propriétaire | Validation OK | ⬜ |
| 3 | Step 2: Infos salon | Nom, catégorie, adresse, ville | ⬜ |
| 4 | Sélectionner catégorie | Dropdown catégories valides | ⬜ |
| 5 | Step 3: Services initiaux | Ajouter services (nom, prix, durée) | ⬜ |
| 6 | Step 4: Horaires | Configurer horaires semaine | ⬜ |
| 7 | Validation finale | Toast "Demande envoyée", email admin | ⬜ |
| 8 | Slug généré | Unique basé sur nom + ville | ⬜ |
| 9 | Email existant | Erreur "Compte existant" | ⬜ |
| 10 | Catégorie manquante | Erreur validation | ⬜ |
| 11 | Horaires vides | Warning "Au moins 1 jour ouvert" | ⬜ |

---

### PR-02: Validation Admin (Salon)

| ID | PR-02 |
|----|-------|
| **Précondition** | Admin connecté |
| **URL** | `/admin/etablissements` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Liste salons "En attente" | Badge pending visible | ⬜ |
| 2 | Click "Approuver" | Salon activé, notification Pro | ⬜ |
| 3 | Click "Rejeter" | Modal motif → Salon rejected | ⬜ |
| 4 | Filtrer "Actifs" | Salons actifs uniquement | ⬜ |
| 5 | Filtrer "Rejetés" | Salons rejected | ⬜ |
| 6 | Search par nom/ville | Résultats filtrés | ⬜ |
| 7 | Voir détails salon | Modal avec toutes infos | ⬜ |

---

### PR-03: Agenda Pro

| ID | PR-03 |
|----|-------|
| **Précondition** | Pro connecté, salon actif |
| **URL** | `/pro/agenda` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher calendrier | Vue semaine/jour | ⬜ |
| 2 | Créer RDV manuel | Modal: client, service, staff, date, heure | ⬜ |
| 3 | Drag & drop RDV | Créneau modifié | ⬜ |
| 4 | Click RDV existant | Modal détails + actions | ⬜ |
| 5 | Annuler RDV | Confirmation, RDV annulé, client notifié | ⬜ |
| 6 | Modifier RDV | Nouveau créneau proposé | ⬜ |
| 7 | Filtrer par staff | Agenda filtré | ⬜ |
| 8 | Vue jour | Liste créneaux horaires | ⬜ |
| 9 | Vue semaine | Grid 7 jours | ⬜ |
| 10 | RDV en temps réel | Socket.io, créneau updated sans refresh | ⬜ |
| 11 | Block temps (pause) | Créneau non réservable | ⬜ |
| 12 | Créneau overlapping | Erreur "Créneau occupé" | ⬜ |

---

### PR-04: Services Pro

| ID | PR-04 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/services` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher liste services | Services avec prix, durée, catégorie | ⬜ |
| 2 | Ajouter service | Modal: nom, prix, durée, description | ⬜ |
| 3 | Modifier service | Form pré-rempli, sauvegarde OK | ⬜ |
| 4 | Supprimer service | Confirmation, service removed | ⬜ |
| 5 | Assigner staff | Checkbox multi-staff | ⬜ |
| 6 | Catégoriser service | Dropdown catégories salon | ⬜ |
| 7 | Désactiver service | Badge "Inactif", non réservable | ⬜ |
| 8 | Ordonner services | Drag reorder | ⬜ |

---

### PR-05: Équipe Pro

| ID | PR-05 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/equipe` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher équipe | Cards membres avec photo, rôle, couleur | ⬜ |
| 2 | Ajouter membre | Modal: nom, rôle, email, phone, horaires | ⬜ |
| 3 | Modifier membre | Form pré-rempli | ⬜ |
| 4 | Supprimer membre | Confirmation, membre removed | ⬜ |
| 5 | Toggle actif/inactif | Membre désactivé, RDV non attribués | ⬜ |
| 6 | Configurer horaires | Grille 7 jours avec start/end | ⬜ |
| 7 | Couleur agenda | Picker couleur unique | ⬜ |
| 8 | Inviter par email | Email envoyé, lien inscription | ⬜ |
| 9 | Membre invité | Compte créé, rôle PRO_STAFF | ⬜ |

---

### PR-06: Clients Pro (CRM)

| ID | PR-06 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/clients` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher clients | Liste avec nom, email, phone, stats | ⬜ |
| 2 | Search client | Filtrage nom/email/phone | ⬜ |
| 3 | Click client | Modal détails: RDV, total spent, rating | ⬜ |
| 4 | Ajouter note client | Textarea sauvegardée | ⬜ |
| 5 | Créer RDV depuis CRM | Flow réservation avec client pré-sélectionné | ⬜ |
| 6 | Historique RDV | Liste RDV passés du client | ⬜ |
| 7 | Statistiques client | Nb RDV, total dépensé, note moyenne | ⬜ |
| 8 | Export CSV | Liste clients téléchargeable | ⬜ |

---

### PR-07: Caisse (POS)

| ID | PR-07 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/caisse` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher POS | Services + produits, panier | ⬜ |
| 2 | Ajouter service au panier | Ligne panier avec prix, qty | ⬜ |
| 3 | Ajouter produit | Ligne séparée | ⬜ |
| 4 | Modifier quantité | Boutons +/-, total updated | ⬜ |
| 5 | Retirer item | Ligne supprimée | ⬜ |
| 6 | Sélectionner client | Dropdown/search | ⬜ |
| 7 | Total calculé | Sous-total, total affiché | ⬜ |
| 8 | Paiement carte | Modal paiement Stripe | ⬜ |
| 9 | Paiement espèces | Modal montant reçu, rendu | ⬜ |
| 10 | Paiement chèque | Numéro chèque | ⬜ |
| 11 | Paiement carte cadeau | Code validation | ⬜ |
| 12 | Imprimer reçu | Print dialog | ⬜ |
| 13 | Envoyer reçu email | Email envoyé | ⬜ |
| 14 | Panier vide | Message "Ajouter items" | ⬜ |
| 15 | Split paiement | Multiple méthodes | ⬜ |

---

### PR-08: Stock (Produits)

| ID | PR-08 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/stock` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Afficher produits | Liste avec qty, prix, alertes | ⬜ |
| 2 | Ajouter produit | Modal: nom, SKU, prix, qty initiale | ⬜ |
| 3 | Modifier qty | Input +/- | ⬜ |
| 4 | Alerte stock bas | Badge rouge qty < threshold | ⬜ |
| 5 | Historique mouvements | Log entrées/sorties | ⬜ |
| 6 | Vendre produit | Caisse -> stock décrémenté | ⬜ |

---

### PR-09: Statistiques Pro

| ID | PR-09 |
|----|-------|
| **Précondition** | Pro connecté |
| **URL** | `/pro/statistiques` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Dashboard KPIs | RDV/mois, revenus, clients nouveaux | ⬜ |
| 2 | Graph revenus | Bar chart mensuel | ⬜ |
| 3 | Top services | Liste services populaires | ⬜ |
| 4 | Top staff | Membres performants | ⬜ |
| 5 | Satisfaction client | Note moyenne, distribution | ⬜ |
| 6 | Filtre période | Jour, semaine, mois, année | ⬜ |
| 7 | Export PDF | Rapport téléchargeable | ⬜ |

---

### PR-10: Paramètres Salon

| ID | PR-10 |
|----|-------|
| **Précondition** | Pro owner |
| **URL** | `/pro/parametres` |

#### Scénarios

| # | Action | Attendu | Status |
|---|--------|---------|--------|
| 1 | Modifier infos salon | Nom, adresse, phone, email | ⬜ |
| 2 | Changer catégorie | Dropdown catégories | ⬜ |
| 3 | Modifier horaires | Grille 7 jours | ⬜ |
| 4 | Ajouter photos salon | Upload images | ⬜ |
| 5 | Supprimer photo | Confirmation | ⬜ |
| 6 | Connecter Stripe | OAuth Stripe Connect | ⬜ |
| 7 | Configurer notifications | Toggle email/SMS | ⬜ |
| 8 | Supprimer salon | Zone danger, confirmation, data wiped | ⬜ |

---

## Edge Cases

### EC-01: Conflit de créneau

| # | Contexte | Attendu |
|---|----------|--------|
| 1 | User A et B réservent même créneau | Premier validé, second bloqué |
| 2 | RDV créé pendant réservation User | Socket refresh, créneau disabled |
| 3 | Staff modifie horaires pendant RDV | RDV existant préservé |

### EC-02: Paiements

| # | Contexte | Attendu |
|---|----------|--------|
| 1 | Paiement Stripe échoué | Erreur affichée, RDV non créé |
| 2 | Remboursement partiel | Calcul correct |
| 3 | Stripe non connecté | Paiement en ligne désactivé |

### EC-03: Permissions

| # | Contexte | Attendu |
|---|----------|--------|
| 1 | Staff accède `/pro/parametres` | Accès denied (owner only) |
| 2 | Client accède `/pro/agenda` | Redirection `/connexion` |
| 3 | Admin accède `/pro/*` | Full access |

### EC-04: Internationalisation

| # | Contexte | Attendu |
|---|----------|--------|
| 1 | Interface FR | Textes français |
| 2 | Interface AR | RTL, textes arabes |
| 3 | Dates format | FR: 25/04/2026, AR: 2026/04/25 |

### EC-05: SEO

| # | Contexte | Attendu |
|---|----------|--------|
| 1 | Page `[city]/[category]` | Meta title/desc dynamiques |
| 2 | Slug salon | URL friendly, unique |
| 3 | Sitemap | Généré automatiquement |
| 4 | Robots.txt | Configuré |

---

## Checklist Go-Live

### Pre-Production

| # | Item | Status |
|---|------|--------|
| 1 | Seed data prod (villes, catégories) | ⬜ |
| 2 | Comptes test créés | ⬜ |
| 3 | Stripe Connect test mode | ⬜ |
| 4 | Email templates Resend | ⬜ |
| 5 | SMS Twilio test | ⬜ |
| 6 | Domain `.ma` configuré | ⬜ |
| 7 | SSL certificat | ⬜ |
| 8 | Redis prod | ⬜ |
| 9 | PostGIS géoloc | ⬜ |

### Smoke Tests Prod

| # | Test | Status |
|---|------|--------|
| 1 | Inscription User OK | ⬜ |
| 2 | Inscription Pro OK | ⬜ |
| 3 | Recherche salons OK | ⬜ |
| 4 | Réservation complète OK | ⬜ |
| 5 | Email confirmation reçu | ⬜ |
| 6 | SMS rappel reçu | ⬜ |
| 7 | Stripe paiement OK | ⬜ |
| 8 | Agenda Pro temps réel | ⬜ |
| 9 | Admin validation salon | ⬜ |

---

## 📊 Rapport de Test

| Parcours | Total scénarios | Passés | Échoués |
|----------|-----------------|--------|---------|
| User | 45 | 0 | 0 |
| Pro | 60 | 0 | 0 |
| Edge Cases | 15 | 0 | 0 |
| **TOTAL** | **120** | **0** | **0** |

---

*Document généré pour Planity.ma — Tests fonctionnels v1.0*