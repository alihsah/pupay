import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </main>
  );
}

export default SignInPage;