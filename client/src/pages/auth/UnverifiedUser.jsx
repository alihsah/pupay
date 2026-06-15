import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import Button from "../../components/ui/Button";

function UnverifiedUser() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Unable to sign out:", error);
      setIsSigningOut(false);
    }
  };

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
          maxWidth: "500px",
          padding: "2rem",
          borderRadius: "24px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            display: "inline-flex",
            marginBottom: "0.9rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            background: "var(--color-primary-soft)",
            color: "var(--color-primary)",
            fontSize: "0.82rem",
            fontWeight: "700",
          }}
        >
          PUPay account verification
        </p>

        <h1 style={{ marginBottom: "0.75rem" }}>Account Not Verified</h1>

        <p
          style={{
            marginBottom: "1.5rem",
            color: "var(--color-text-muted)",
            lineHeight: "1.6",
          }}
        >
          Your account is not registered as an authorized PUPay user. Please
          contact your treasurer or administrator if you believe this is a
          mistake.
        </p>

        <Button onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut
            ? "Signing out..."
            : "Sign out and return to landing page"}
        </Button>
      </section>
    </main>
  );
}

export default UnverifiedUser;
