
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 0.1,
  
  // Setting this option to true will print useful information
  debug: false,
  
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0.05,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
