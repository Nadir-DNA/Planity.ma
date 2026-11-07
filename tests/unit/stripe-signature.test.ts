import { describe, it, expect, vi } from "vitest";
import { createHmac } from "crypto";

// Le service importe le client Supabase au chargement : inutile ici
vi.mock("@/lib/supabase-helpers", () => ({
  supabaseAdmin: {},
  findById: vi.fn(),
  insertRow: vi.fn(),
  updateRow: vi.fn(),
}));

import { verifyStripeSignature } from "@/server/services/stripe-subscription.service";

const SECRET = "whsec_test";
const BODY = '{"id":"evt_1","type":"checkout.session.completed"}';
const NOW = 1_800_000_000;

function sign(body: string, t: number, secret = SECRET) {
  return createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
}

describe("verifyStripeSignature", () => {
  it("accepte une signature valide", () => {
    expect(verifyStripeSignature(BODY, `t=${NOW},v1=${sign(BODY, NOW)}`, SECRET, NOW)).toBe(true);
  });

  it("accepte si une des signatures v1 est valide (rotation de secret)", () => {
    const header = `t=${NOW},v1=${sign(BODY, NOW, "ancien")},v1=${sign(BODY, NOW)}`;
    expect(verifyStripeSignature(BODY, header, SECRET, NOW)).toBe(true);
  });

  it("refuse un body modifié", () => {
    expect(verifyStripeSignature(BODY + " ", `t=${NOW},v1=${sign(BODY, NOW)}`, SECRET, NOW)).toBe(false);
  });

  it("refuse un mauvais secret", () => {
    expect(verifyStripeSignature(BODY, `t=${NOW},v1=${sign(BODY, NOW, "autre")}`, SECRET, NOW)).toBe(false);
  });

  it("refuse un événement rejoué hors de la fenêtre de 5 minutes", () => {
    const old = NOW - 301;
    expect(verifyStripeSignature(BODY, `t=${old},v1=${sign(BODY, old)}`, SECRET, NOW)).toBe(false);
  });

  it("refuse un en-tête absent ou incomplet", () => {
    expect(verifyStripeSignature(BODY, null, SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(BODY, `t=${NOW}`, SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(BODY, `v1=${sign(BODY, NOW)}`, SECRET, NOW)).toBe(false);
  });
});
