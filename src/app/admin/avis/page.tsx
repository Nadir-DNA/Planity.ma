import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Modération avis",
};

export default function AdminReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Modération des avis
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              12 avis en attente
            </span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-md">
            En attente
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Approuvés
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Refusés
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Tous
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Review Card - Pending */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    Jean Dupont
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    En attente
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Salon: Coiffure Moderna • 15 avril 2026
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <svg
                  className="h-5 w-5 text-gray-300 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Excellent service! Ma coupe est exactement comme je le voulais. 
              Le personnel est très professionnel et accueillant. Je recommande!
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Approuver
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Refuser
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Voir salon
              </button>
            </div>
          </div>

          {/* Review Card - Approved */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-75">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    Marie Laurent
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Approuvé
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Salon: Spa Zen • 14 avril 2026
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Le spa est magnifique! Un vrai moment de détente. 
              Le massage était parfait.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Approuvé le 14 avril 2026
              </span>
            </div>
          </div>

          {/* Review Card - Rejected */}
          <div className="bg-white rounded-lg border border-red-200 p-6 opacity-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    User123
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Refusé
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Salon: Barber Club • 12 avril 2026
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                {[3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-gray-300 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Ce commentaire a été refusé pour non-respect des règles de modération.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-600">
                Refusé: Contenu inapproprié
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}