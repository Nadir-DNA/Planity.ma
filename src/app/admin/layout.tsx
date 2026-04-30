import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Check authentication
  if (!session?.user) {
    redirect("/connexion?redirect=/admin");
  }
  
  // Check ADMIN role
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin</h2>
          <p className="text-sm text-gray-400">Planity.ma</p>
        </div>
        
        <nav className="space-y-2">
          <a href="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">
            Dashboard
          </a>
          <a href="/admin/salons" className="block px-3 py-2 rounded hover:bg-gray-800">
            Salons
          </a>
          <a href="/admin/avis" className="block px-3 py-2 rounded hover:bg-gray-800">
            Modération avis
          </a>
          <a href="/admin/utilisateurs" className="block px-3 py-2 rounded hover:bg-gray-800">
            Utilisateurs
          </a>
          <a href="/admin/finances" className="block px-3 py-2 rounded hover:bg-gray-800">
            Finances
          </a>
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <a href="/" className="block px-3 py-2 rounded hover:bg-gray-800 text-sm">
            ← Retour au site
          </a>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  );
}