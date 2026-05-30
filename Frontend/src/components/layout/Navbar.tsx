import { NavLink, useNavigate } from "react-router";
import { BadgeDollarSign, LogOut, MapIcon } from 'lucide-react';
import { cn } from "../../lib/utils.ts";
import { BookOpen, Map, PlusCircle, LayoutDashboard, PenLine, PersonStanding, Shield, Wheat, Route } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../molecules/navigation-menu.tsx';
import { logoutUser } from '../../features/auth/services/authService';
import { useAuthStore } from '../../store/authStore';
import { useProfile } from "@/features/stakeholders/hooks/useProfile";

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export default function Navbar() {
  const navigate = useNavigate();
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { user, isAuthenticated } = useAuthStore();

  const { data: profile } = useProfile(user?.id ?? 0);
  const authRole = user?.role?.toLowerCase();
  const profileRole = profile?.role?.toLowerCase();
  const isAdmin = authRole === "admin";
  const isAuthor = profileRole === "author";
  const isTourist = !isAdmin && profileRole === "tourist";



  const navItems = [
      { path: "/home", label: "Home", icon: LayoutDashboard, show: true },
      { path: "/admin/users", label: "Users", icon: PersonStanding, show: isAuthenticated && isAdmin },
      { path: "/login", label: "Log in", icon: Shield, show: !isAuthenticated },
      { path: `/profile/${user?.id}`, label: "My Profile", icon: Wheat, show: isAuthenticated && !isAdmin },
      { path: "/tours/create", label: "Create Tour", icon: PlusCircle, show: isAuthenticated && isAuthor },
      { path: "/tours", label: "My Tours", icon: Route, show: isAuthenticated && isAuthor },
      { path: "/tourist/tours", label: "Tours", icon: Route, show: isAuthenticated && isTourist },
      { path: "/blogs", label: "Blogs", icon: BookOpen, show: isAuthenticated && !isAdmin },
      { path: "/blogs/create", label: "Create Blog", icon: PenLine, show: isAuthenticated && !isAdmin },
      { path: "/tours/purchased", label: "Purchased Tours", icon: BadgeDollarSign, show: isAuthenticated && isTourist },
      { path: "/tours/active", label: "Active Tour", icon: MapIcon, show: isAuthenticated && isTourist },
  ];
  const visibleItems = navItems.filter((item) => item.show);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
      <nav className="sticky top-0 z-50 w-full border-b border-(--border) bg-(--bg)/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-4 max-w-7xl mx-auto">
          <div className="mr-6 font-semibold text-(--text-h) tracking-tight select-none">
            SOA Projekat
          </div>

          <NavigationMenu className="flex-1 justify-start">
            <NavigationMenuList className="gap-1 space-x-0">
              {visibleItems.map(({ path, label, icon: Icon }) => (
                  <NavigationMenuItem key={path} className="group relative">
                    <NavigationMenuLink asChild>
                      <NavLink
                          to={path}
                          className={({ isActive }) =>
                              cn(
                                  'relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                                  isActive
                                      ? 'text-(--accent)'
                                      : 'text-(--text) group-hover:text-(--accent)'
                              )
                          }
                      >
                    <span
                        className={cn(
                            'absolute inset-0 rounded-md transition-all duration-200 ease-out pointer-events-none',
                            'bg-(--accent-bg) scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100',
                            'aria-[aria-current="page"]:scale-100 aria-[aria-current="page"]:opacity-100'
                        )}
                    />
                        <Icon className="relative h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px" />
                        <span className="relative">{label}</span>
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {isAuthenticated && (
              <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-(--text) hover:text-(--accent) transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
          )}
        </div>
      </nav>
  );
}