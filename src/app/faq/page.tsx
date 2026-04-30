
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const faqs = {
  users: [
    { q: "Comment réserver un rendez-vous?", a: "Recherchez un salon, choisissez un service, sélectionnez une date et un créneau disponible, puis confirmez votre réservation." },
    { q: "Comment annuler une réservation?", a: "Accédez à Mes rendez-vous dans votre compte, cliquez sur la réservation à annuler. Attention: respectez la politique d annulation du salon." },
    { q: "Dois-je payer en ligne?", a: "Non, le paiement est effectué en salon sauf si un acompte est demandé. Vous pouvez payer en espèces, carte ou chèque selon le salon." },
    { q: "Comment laisser un avis?", a: "Après votre rendez-vous, vous recevrez une invitation à laisser un avis. Vous pouvez aussi le faire depuis votre historique de réservations." },
  ],
  pros: [
    { q: "Comment inscrire mon salon?", a: "Cliquez sur Proposer votre salon sur la page d accueil. Remplissez le formulaire avec vos informations. Votre salon sera validé sous 48h." },
    { q: "Combien coûte le service?", a: "L inscription et l utilisation basique sont gratuites. Des options premium sont disponibles pour plus de visibilité." },
    { q: "Comment gérer mes disponibilités?", a: "Dans votre dashboard Pro, utilisez l agenda pour définir vos horaires, ajouter des absences, et gérer les rendez-vous." },
    { q: "Comment recevoir les paiements?", a: "Les clients payent directement en salon. Pour les acomptes en ligne, nous transférons les fonds sur votre compte bancaire." },
  ],
};

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Foire Aux Questions</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Pour les clients</TabsTrigger>
          <TabsTrigger value="pros">Pour les professionnels</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-3">
            {faqs.users.map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pros">
          <div className="space-y-3">
            {faqs.pros.map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
