import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect("/connexion");
  }

  if (!user) {
    redirect("/connexion");
  }

  if (user.role === "CONSUMER") {
    redirect("/");
  }

  return <>{children}</>;
}