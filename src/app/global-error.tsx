
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#f5f5f5"
        }}>
          <div style={{
            maxWidth: "400px",
            width: "100%",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>500</h1>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>Erreur critique</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              Une erreur critique s est produite. Veuillez réessayer.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2dd4a8",
                color: "black",
                borderRadius: "8px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
