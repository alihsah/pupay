import { Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import "../../styles/components/layout/Topbar.css";

const pageTitles = {
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle: "Track collections, payments, and student status.",
  },
  "/admin/collections": {
    title: "Collections",
    subtitle: "Create and manage payment collection events.",
  },
  "/admin/payments": {
    title: "Payments",
    subtitle: "Monitor pending, paid, and overdue payments.",
  },
  "/admin/students": {
    title: "Students",
    subtitle: "Manage student records and payment status.",
  },
  "/admin/announcements": {
    title: "Announcements",
    subtitle: "Create payment reminders and school announcements.",
  },
  "/admin/ai-helper": {
    title: "AI Helper",
    subtitle: "Generate reminders, summaries, announcements, and insights.",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Manage account and system preferences.",
  },
  "/student/dashboard": {
    title: "Student Dashboard",
    subtitle: "View your collections, payments, and reminders.",
  },
  "/student/collections": {
    title: "My Collections",
    subtitle: "View active and upcoming payment collections.",
  },
  "/student/payments": {
    title: "My Payments",
    subtitle: "Track your payment history and status.",
  },
  "/student/announcements": {
    title: "Announcements",
    subtitle: "Read payment reminders and updates.",
  },
  "/student/profile": {
    title: "Profile",
    subtitle: "View and manage your student account.",
  },
};

function Topbar() {
  const location = useLocation();
  const { currentUser } = useCurrentUser();

  const currentPage = pageTitles[location.pathname] || {
    title: "PUPay",
    subtitle: "AI-assisted payment collection and tracking system.",
  };

  return (
    <header className="topbar">
      <div>
        <h1>{currentPage.title}</h1>
        <p>{currentPage.subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search collections, payments..." />
        </div>

        <button className="topbar-icon-btn" type="button">
          <Bell size={20} />
        </button>

        <div className="topbar-profile">
          <UserButton afterSignOutUrl="/" />

          <div className="topbar-user-info">
            <span>{currentUser?.fullName || currentUser?.email || "User"}</span>
            <small>
              {currentUser?.role === "admin" ? "Administrator" : "Student"}
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;