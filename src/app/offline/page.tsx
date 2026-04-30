"use client";

import { Metadata } from "next";

// Note: Metadata not allowed in client components - moved to parent or use generateMetadata

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Vous êtes hors ligne
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Il semble que vous n&apos;avez pas de connexion internet. 
          Vérifiez votre connexion et réessayez.
        </p>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#2dd4a8] hover:bg-[#26c49a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2dd4a8] transition-colors"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Réessayer
        </button>

        {/* Cached pages */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            Pages disponibles hors ligne
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href="/"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Accueil
            </a>
            <a
              href="/rechercher"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Rechercher
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}