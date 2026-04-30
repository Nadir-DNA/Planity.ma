
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    
    showToast.success("Message envoyé! Nous vous répondrons sous 48h.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contactez-nous</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sujet</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Question, problème, suggestion..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Votre message..."
                required
                rows={5}
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm resize-none focus:ring-2 focus:ring-mint"
              />
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Envoyer
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-3">Autres moyens de contact</h3>
            <div className="space-y-2 text-neutral-600">
              <p>Email: contact@planity.ma</p>
              <p>Téléphone: +212 5XX XXXXXX</p>
              <p>WhatsApp: +212 6XX XXXXXX</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
