import {
  Archive,
  Bell,
  WalletCards,
  CreditCard,
  Home,
  Users,
  Megaphone,
  Sparkles,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getStudentUnreadNotificationCount } from "../../services/notificationService";
import "../../styles/components/layout/Sidebar.css";

const adminMenuItems = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/admin/dashboard",
  },
  {
    label: "Collections",
    icon: WalletCards,
    path: "/admin/collections",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/admin/payments",
  },
  {
    label: "Students",
    icon: Users,
    path: "/admin/students",
  },
  {
    label: "Announcements",
    icon: Megaphone,
    path: "/admin/announcements",
  },
  {
    label: "Archives",
    path: "/admin/archives",
    icon: Archive,
  },
  {
    label: "AI Helper",
    icon: Sparkles,
    path: "/admin/ai-helper",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const studentMenuItems = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/student/dashboard",
  },
  {
    label: "My Collections",
    icon: WalletCards,
    path: "/student/collections",
  },
  {
    label: "Payment History",
    icon: CreditCard,
    path: "/student/payments",
  },
  {
    label: "Profile",
    icon: UserRound,
    path: "/student/profile",
  },
];

const adminDrawerItems = [
  {
    label: "Home",
    icon: Home,
    path: "/admin/dashboard",
  },
  {
    label: "Collections",
    icon: WalletCards,
    path: "/admin/collections",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/admin/payments",
  },
  {
    label: "Announcements",
    icon: Megaphone,
    path: "/admin/announcements",
  },
  {
    label: "Students",
    icon: Users,
    path: "/admin/students",
  },
  {
    label: "AI Helper",
    icon: Sparkles,
    path: "/admin/ai-helper",
  },
  {
    label: "Archives",
    icon: Archive,
    path: "/admin/archives",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const studentDrawerItems = [
  {
    label: "Home",
    icon: Home,
    path: "/student/dashboard",
  },
  {
    label: "Collections",
    icon: WalletCards,
    path: "/student/collections",
  },
  {
    label: "Payment History",
    icon: CreditCard,
    path: "/student/payments",
  },
  {
    label: "Announcements",
    icon: Megaphone,
    path: "/student/announcements",
  },
  {
    label: "Profile",
    icon: UserRound,
    path: "/student/profile",
  },
];

function Sidebar({ isMobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isStudentPage = location.pathname.startsWith("/student");
  const menuItems = isStudentPage ? studentMenuItems : adminMenuItems;
  const drawerItems = isStudentPage ? studentDrawerItems : adminDrawerItems;

  const loadUnreadCount = useCallback(async () => {
    if (!isStudentPage) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getStudentUnreadNotificationCount();
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      setUnreadCount(0);
    }
  }, [isStudentPage]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount, location.pathname]);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      loadUnreadCount();
    };

    window.addEventListener(
      "pupay:notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      window.removeEventListener(
        "pupay:notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [loadUnreadCount]);

  return (
    <>
      <button
        className={`sidebar-overlay ${isMobileOpen ? "is-open" : ""}`}
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        tabIndex={isMobileOpen ? 0 : -1}
      />

      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">
              <img
                className="sidebar-logo-image"
                src="/pupay-logo.png"
                alt="PUPay logo"
              />
            </div>

            <div className="sidebar-logo-text">
              <h2>PUPay</h2>
              <p>{isStudentPage ? "Student Portal" : "Admin Portal"}</p>
            </div>

            <button
              className="sidebar-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav sidebar-desktop-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  title={item.label}
                >
                  <Icon size={21} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <nav className="sidebar-nav sidebar-drawer-nav" aria-label="Mobile navigation">
            {drawerItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                  title={item.label}
                >
                  <Icon size={21} />
                  <span>{item.label}</span>
                  {item.showUnreadBadge && unreadCount > 0 && (
                    <span className="sidebar-notification-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
