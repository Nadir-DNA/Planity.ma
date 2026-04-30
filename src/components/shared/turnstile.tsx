"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Declare the global turnstile function added by the script
declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  retry?: "auto" | "never";
  retryInterval?: number;
  refreshExpiredTimeout?: number;
  language?: string;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function Turnstile({
  onVerify,
  onExpire,
  onError,
  theme = "auto",
  size = "normal",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    // Remove any existing widget first
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Widget may have been removed already
      }
      widgetIdRef.current = null;
    }

    // Clear the container
    containerRef.current.innerHTML = "";

    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "error-callback": onError,
      "expired-callback": onExpire,
      theme,
      size,
      language: "fr",
    });

    widgetIdRef.current = id;
  }, [siteKey, onVerify, onExpire, onError, theme, size]);

  useEffect(() => {
    // Skip if no site key (dev mode without Turnstile configured)
    if (!siteKey || siteKey.startsWith("0x4AAAAAAAxxxx")) {
      // Auto-verify with a dummy token in dev
      console.warn("[Turnstile] Site key not configured — skipping widget");
      onVerify("dev-bypass-token");
      return;
    }

    // Check if script already loaded
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    // Load the Turnstile script
    const existingScript = document.querySelector(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`
    );

    if (existingScript) {
      // Script tag exists, wait for it to load
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("[Turnstile] Failed to load script");
      onError?.();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [siteKey, onVerify, onError]);

  useEffect(() => {
    if (scriptLoaded && siteKey && !siteKey.startsWith("0x4AAAAAAAxxxx")) {
      renderWidget();
    }
  }, [scriptLoaded, renderWidget, siteKey]);

  // If no site key configured, don't render anything
  if (!siteKey || siteKey.startsWith("0x4AAAAAAAxxxx")) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center turnstile-widget"
    />
  );
}