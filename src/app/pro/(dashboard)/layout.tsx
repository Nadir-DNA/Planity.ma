import { redirect } from "next/navigation";
import { getUser, getProSalonId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import ProShell from "./pro-shell";

export const dynamic = "force-dynamic";

/**
 * Garde serveur du dashboard pro :
 * - pas de session → /connexion
 * - pas de salon → onboarding (/pro/inscription)
 * Le shell reçoit le vrai salon (fini le "Salon Elegance" codé en dur).
 */
export default async function ProDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/connexion?callbackUrl=/pro");
  }

  const salonId = await getProSalonId(user);
  if (!salonId) {
    redirect("/pro/inscription");
  }

  const { data: salon } = await supabaseAdmin
    .from("Salon")
    .select("name, city, slug")
    .eq("id", salonId)
    .single();

  return (
    <ProShell
      salon={{
        name: salon?.name ?? "Mon salon",
        city: salon?.city ?? "",
        slug: salon?.slug ?? "",
      }}
    >
      {children}
    </ProShell>
  );
}
