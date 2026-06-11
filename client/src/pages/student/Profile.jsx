import {
  UserRound,
  Mail,
  GraduationCap,
  Hash,
  ShieldCheck,
  Palette,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

import { useCurrentUser } from "../../hooks/useCurrentUser";

import "../../styles/pages/student/Profile.css";

function StudentProfile() {
  const { currentUser, loading } = useCurrentUser();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <main className="student-profile-page">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="student-profile-page">
        <p>Unable to load your profile.</p>
      </main>
    );
  }

  const yearMap = {
    "1st Year": "1",
    "2nd Year": "2",
    "3rd Year": "3",
    "4th Year": "4",
  };

  const programSection =
  currentUser.course && currentUser.yearLevel && currentUser.section
    ? `${currentUser.course} ${yearMap[currentUser.yearLevel]}-${currentUser.section}`
    : "Not available";

  const profileItems = [
    {
      label: "Full Name",
      value: currentUser.fullName || "Not available",
      icon: UserRound,
    },
    {
      label: "Student Number",
      value: currentUser.studentNumber || "Not available",
      icon: Hash,
    },
    {
      label: "Personal Email",
      value: currentUser.email || "Not available",
      icon: Mail,
    },
    {
      label: "Year Level",
      value: currentUser.yearLevel || "Not available",
      icon: GraduationCap,
    },
    {
      label: "Role",
      value: currentUser.role || "student",
      icon: ShieldCheck,
    },

    {
      label: "Program Section",
      value: programSection,
      icon: GraduationCap,
    },
  ];

  return (
    <main className="student-profile-page">
      <section className="student-profile-hero">
        <div className="student-profile-avatar">
          {currentUser.fullName?.charAt(0) || "S"}
        </div>

        <div>
          <h2>{currentUser.fullName || "Student"}</h2>
          <p>
            View your linked student record and account verification details.
          </p>
        </div>

        <span className={`profile-status-pill ${currentUser.status || "active"}`}>
          {currentUser.status || "active"}
        </span>
      </section>

      <section className="student-profile-panel">
        <div className="student-profile-panel-header">
          <div>
            <h3>Student Information</h3>
            <p>
              This information is based on the student record verified by the
              treasurer.
            </p>
          </div>
        </div>

        <div className="student-profile-grid">
          {profileItems.map((item) => {
            const Icon = item.icon;

            return (
              <article className="student-profile-item" key={item.label}>
                <div className="student-profile-item-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="student-profile-panel">
        <div className="student-profile-panel-header">
          <div>
            <h3>Theme Preference</h3>
            <p>Switch between light and dark mode for your student portal.</p>
          </div>
        </div>

        <div className="student-theme-card">
          <div className="student-profile-item-icon">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </div>

          <div className="student-theme-content">
            <h4>{theme === "dark" ? "Dark Mode" : "Light Mode"}</h4>
            <p>
              Your theme preference is saved only for your account on this browser.
            </p>
          </div>

          <button
            className="student-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </section>

      <section className="student-profile-note">
        <h3>Need to update your information?</h3>
        <p>
          Contact your class treasurer or system administrator. Students can view
          their profile, but only authorized admins can update student records.
        </p>
      </section>
    </main>
  );
}

export default StudentProfile;