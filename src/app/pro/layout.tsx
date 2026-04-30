import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/connexion");
  }

  if (!session) {
    redirect("/connexion");
  }

  if (session.user.role === "CONSUMER") {
    redirect("/");
  }

  return <>{children}</>;
}