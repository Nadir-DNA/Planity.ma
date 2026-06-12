import { getUser } from "@/lib/auth";
import OnboardingForm from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function ProRegistrationPage() {
  const user = await getUser();

  return (
    <OnboardingForm
      currentUser={
        user ? { id: user.id, name: user.name, email: user.email } : null
      }
    />
  );
}
