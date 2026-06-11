import { UserRound, Mail, ShieldCheck, Palette, Info, Moon, Sun} from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useTheme } from "../../context/ThemeContext";

import "../../styles/pages/admin/Settings.css";

function AdminSettings() {
  const { currentUser, loading } = useCurrentUser();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <main className="settings-page">
        <p>Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <section className="settings-hero">
        <div className="settings-avatar">
          {currentUser?.fullName?.charAt(0) || "A"}
        </div>

        <div>
          <h2>{currentUser?.fullName || "Administrator"}</h2>
          <p>Manage account details and system preferences.</p>
        </div>

        <span className="settings-role-pill">
          {currentUser?.role === "admin" ? "Administrator" : currentUser?.role}
        </span>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <h3>Account Information</h3>
            <p>Your account is connected through Clerk authentication.</p>
          </div>
        </div>

        <div className="settings-grid">
          <article className="settings-item">
            <div className="settings-item-icon">
              <UserRound size={20} />
            </div>

            <div>
              <span>Name</span>
              <strong>{currentUser?.fullName || "Not available"}</strong>
            </div>
          </article>

          <article className="settings-item">
            <div className="settings-item-icon">
              <Mail size={20} />
            </div>

            <div>
              <span>Email</span>
              <strong>{currentUser?.email || "Not available"}</strong>
            </div>
          </article>

          <article className="settings-item">
            <div className="settings-item-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>Role</span>
              <strong>{currentUser?.role || "admin"}</strong>
            </div>
          </article>

          <article className="settings-item">
            <div className="settings-item-icon">
              <Info size={20} />
            </div>

            <div>
              <span>System Access</span>
              <strong>Payment management portal</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-header">
          <div>
            <h3>System Preferences</h3>
            <p>Interface preferences and display settings for the dashboard.</p>
          </div>
        </div>

        <div className="settings-preference-card">
          <div className="settings-item-icon">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </div>

          <div className="settings-preference-content">
            <h4>Theme Preference</h4>
            <p>
              Switch between light and dark mode for a more comfortable dashboard
              experience.
            </p>
          </div>

          <button
            className="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </section>

      <section className="settings-note">
        <h3>Administrator Note</h3>
        <p>
          Admin accounts can manage student records, collections, payments, and
          announcements. Sensitive changes should be handled carefully because
          they affect student access and payment tracking.
        </p>
      </section>
    </main>
  );
}

export default AdminSettings;