
import { Card } from "@/components/ui/card";

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Conditions Générales d Utilisation</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Objet</h2>
          <p className="text-neutral-600 leading-relaxed">
            Les présentes conditions générales d utilisation (CGU) régissent l accès et l utilisation 
            de la plateforme Planity.ma, service de réservation en ligne pour salons de beauté au Maroc.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Services proposés</h2>
          <p className="text-neutral-600 leading-relaxed">
            Planity.ma permet aux utilisateurs de: rechercher des salons, consulter les services et prix, 
            réserver des rendez-vous en ligne, laisser des avis sur les salons visités.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Inscription</h2>
          <p className="text-neutral-600 leading-relaxed">
            L utilisation du service de réservation nécessite la création d un compte utilisateur. 
            Vous devez fournir des informations exactes et les maintenir à jour.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Réservations</h2>
          <p className="text-neutral-600 leading-relaxed">
            Les réservations effectuées via la plateforme sont soumises aux conditions spécifiques 
            de chaque salon. En cas d annulation, respectez la politique du salon affichée lors de la réservation.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Responsabilités</h2>
          <p className="text-neutral-600 leading-relaxed">
            Planity.ma est une plateforme intermédiaire. Nous ne sommes pas responsables de la qualité 
            des services fournis par les salons partenaires.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Données personnelles</h2>
          <p className="text-neutral-600 leading-relaxed">
            Vos données personnelles sont traitées conformément à notre politique de confidentialité 
            et aux lois marocaines sur la protection des données.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Modification des CGU</h2>
          <p className="text-neutral-600 leading-relaxed">
            Planity.ma peut modifier ces CGU à tout moment. Les utilisateurs seront informés 
            des modifications significatives par email ou notification sur la plateforme.
          </p>
        </section>

        <p className="text-sm text-neutral-500 mt-8">
          Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
        </p>
      </Card>
    </div>
  );
}
