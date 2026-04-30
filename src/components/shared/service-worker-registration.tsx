"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered:", registration.scope);
            
            // Vérifier les mises à jour
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Nouvelle version disponible
                    console.log("[PWA] New version available");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);
  
  return null;
}