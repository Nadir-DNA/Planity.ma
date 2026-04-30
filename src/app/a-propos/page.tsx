
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">À propos de Planity.ma</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Notre mission</h2>
          <p className="text-neutral-600 leading-relaxed">
            Planity.ma simplifie la recherche et la réservation de services de beauté au Maroc. 
            Nous connectons les clients aux meilleurs salons et permettons aux professionnels 
            de gérer facilement leur activité.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Pour les clients</h2>
          <p className="text-neutral-600 leading-relaxed">
            Trouvez le salon idéal près de chez vous. Consultez les services, prix et avis. 
            Réservez en quelques clics, 24h/24. Recevez des rappels automatiques avant votre rendez-vous.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Pour les professionnels</h2>
          <p className="text-neutral-600 leading-relaxed">
            Gagnez de nouveaux clients grâce à notre plateforme. Gérez vos rendez-vous, 
            votre équipe et vos services depuis un dashboard intuitif. Analysez votre performance 
            et optimisez votre activité.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">L équipe</h2>
          <p className="text-neutral-600 leading-relaxed">
            Planity.ma est développé par une équipe passionnée, basée au Maroc, 
            avec l objectif de digitaliser le secteur de la beauté et améliorer 
            l expérience des clients et professionnels.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Nos valeurs</h2>
          <ul className="text-neutral-600 space-y-2">
            <li>• Simplicité: une expérience utilisateur fluide</li>
            <li>• Transparence: prix clairs, avis authentiques</li>
            <li>• Qualité: salons vérifiés et professionnels</li>
            <li>• Innovation: outils modernes pour les professionnels</li>
          </ul>
        </section>
      </Card>
    </div>
  );
}
