import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/connexion");
  }

  if (session.user.role === "CONSUMER") {
    redirect("/");
  }

  return <>{children}</>;
}