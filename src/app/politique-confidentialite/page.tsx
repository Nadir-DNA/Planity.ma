
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Collecte des données</h2>
          <p className="text-neutral-600 leading-relaxed">
            Nous collectons les données nécessaires au fonctionnement du service: nom, email, téléphone, 
            historique de réservations, avis laissés.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Utilisation des données</h2>
          <p className="text-neutral-600 leading-relaxed">
            Les données collectées sont utilisées pour: gérer vos réservations, communiquer avec vous, 
            améliorer nos services, envoyer des notifications pertinentes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Partage des données</h2>
          <p className="text-neutral-600 leading-relaxed">
            Nous partageons vos données de réservation avec les salons concernés. 
            Nous ne vendons jamais vos données à des tiers.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Sécurité</h2>
          <p className="text-neutral-600 leading-relaxed">
            Nous appliquons des mesures de sécurité standards: chiffrement SSL, accès limité aux données, 
            sauvegardes sécurisées.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Vos droits</h2>
          <p className="text-neutral-600 leading-relaxed">
            Vous avez le droit de: accéder à vos données, les corriger, demander leur suppression, 
            vous opposer à leur traitement. Contactez-nous pour exercer ces droits.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p className="text-neutral-600 leading-relaxed">
            Nous utilisons des cookies pour: maintenir votre session, analyser l utilisation du site, 
            personnaliser votre expérience. Vous pouvez les refuser via les paramètres du navigateur.
          </p>
        </section>

        <p className="text-sm text-neutral-500 mt-8">
          Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
        </p>
      </Card>
    </div>
  );
}
