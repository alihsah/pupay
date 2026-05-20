import {
  LayoutDashboard,
  WalletCards,
  CreditCard,
  Users,
  Megaphone,
  Sparkles,
  Settings,
  LogOut,
  UserRound,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import "../../styles/components/layout/Sidebar.css";

const adminMenuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
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
    icon: LayoutDashboard,
    path: "/student/dashboard",
  },
  {
    label: "My Collections",
    icon: WalletCards,
    path: "/student/collections",
  },
  {
    label: "My Payments",
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

function Sidebar() {
  const location = useLocation();

  const isStudentPage = location.pathname.startsWith("/student");
  const menuItems = isStudentPage ? studentMenuItems : adminMenuItems;

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">P</div>

          <div className="sidebar-logo-text">
            <h2>PUPay</h2>
            <p>{isStudentPage ? "Student Portal" : "Admin Portal"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
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
      </div>

      <button className="sidebar-link logout-link" type="button">
        <LogOut size={21} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;