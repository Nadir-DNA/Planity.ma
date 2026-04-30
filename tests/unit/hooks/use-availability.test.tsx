/**
 * useAvailability Hook Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useAvailability } from "@/hooks/use-availability";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useAvailability", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("should fetch availability", async () => {
    const { result } = renderHook(
      () => useAvailability("salon-1", "2024-03-20"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.availability).toHaveLength(2);
  });

  it("should not fetch if salonId is null", () => {
    const { result } = renderHook(
      () => useAvailability(null, "2024-03-20"),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    // When disabled, the query doesn't run so isIdle is undefined
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should handle API errors", async () => {
    server.use(
      http.get("/api/v1/availability", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );

    const { result } = renderHook(
      () => useAvailability("salon-1", "2024-03-20"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
