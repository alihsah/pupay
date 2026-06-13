import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

function NotFound() {
  const { isLoaded, isSignedIn } = useAuth();

  const returnPath = isSignedIn ? "/dashboard" : "/";
  const returnLabel = isSignedIn ? "Return to Dashboard" : "Return to Landing Page";

  if (!isLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "2rem",
          borderRadius: "24px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "0.5rem",
            fontSize: "3rem",
            lineHeight: "1",
          }}
        >
          404
        </h1>

        <h2 style={{ marginBottom: "0.75rem" }}>Page Not Found</h2>

        <p
          style={{
            marginBottom: "1.5rem",
            color: "var(--color-text-muted)",
            lineHeight: "1.6",
          }}
        >
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          to={returnPath}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1.1rem",
            borderRadius: "999px",
            background: "var(--color-primary)",
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          {returnLabel}
        </Link>
      </section>
    </main>
  );
}

export default NotFound;