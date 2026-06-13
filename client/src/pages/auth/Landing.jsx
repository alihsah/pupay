import { Link, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import "../../styles/pages/auth/Landing.css";

function Landing() {
  return (
    <>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>

      <SignedOut>
        <main className="landing-page">
          <nav className="landing-nav">
            <div className="landing-logo">
              <span>P</span>
              <div>
                <h2>PUPay</h2>
                <p>Payment Tracking System</p>
              </div>
            </div>
          </nav>

          <section className="landing-hero single">
            <div className="landing-content">
              <p className="landing-badge">For PUP Parañaque collections</p>

              <h1>Welcome to PUPay.</h1>

              <p className="landing-description">
                Sign in to access your payment dashboard, view your collections,
                and track payment updates securely.
              </p>

              <div className="landing-actions">
                <Link to="/sign-in" className="landing-primary-btn">
                  Sign In to Continue
                </Link>
              </div>
            </div>
          </section>
        </main>
      </SignedOut>
    </>
  );
}

export default Landing;