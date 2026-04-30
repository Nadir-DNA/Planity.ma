import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy initialization - évite les erreurs au build si les vars ne sont pas set
let ratelimit: Ratelimit | null = null;
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      console.warn("Upstash Redis credentials not configured - rate limiting disabled");
      return null;
    }
    
    redis = new Redis({ url, token });
  }
  return redis;
}

/**
 * Rate limiter pour les routes API publiques
 * 10 requests per 10 seconds par défaut
 */
export function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  
  const redisInstance = getRedis();
  if (!redisInstance) return null;
  
  ratelimit = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "planity-api",
  });
  
  return ratelimit;
}

let authRatelimit: Ratelimit | null = null;
let uploadRatelimit: Ratelimit | null = null;

/**
 * Rate limiter pour l'auth
 * Plus restrictif: 5 requests per minute
 */
export function getAuthRateLimiter(): Ratelimit | null {
  if (authRatelimit) return authRatelimit;
  
  const redisInstance = getRedis();
  if (!redisInstance) return null;
  
  authRatelimit = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "planity-auth",
  });
  
  return authRatelimit;
}

/**
 * Rate limiter pour les uploads
 * Très restrictif: 10 uploads per hour
 */
export function getUploadRateLimiter(): Ratelimit | null {
  if (uploadRatelimit) return uploadRatelimit;
  
  const redisInstance = getRedis();
  if (!redisInstance) return null;
  
  uploadRatelimit = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "planity-upload",
  });
  
  return uploadRatelimit;
}

/**
 * Helper pour vérifier le rate limit dans une API route
 * Retourne null si OK, ou un Response d'erreur 429 si limit dépassé
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null = getRateLimiter()
): Promise<Response | null> {
  if (!limiter) {
    // Rate limiting désactivé - autoriser
    return null;
  }
  
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  
  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Trop de requêtes",
        message: "Veuillez patienter avant de réessayer",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Extrait l'identifiant pour le rate limiting
 * Utilise l'ID utilisateur si authentifié, sinon l'IP
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  // Extraire l'IP du request
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return `ip:${forwarded.split(",")[0].trim()}`;
  }
  
  if (realIp) {
    return `ip:${realIp}`;
  }
  
  // Fallback
  return `ip:unknown`;
}

// Types exportés pour usage externe
export type { Ratelimit } from "@upstash/ratelimit";