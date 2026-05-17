import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Shield, Map } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../molecules/navigation-menu.tsx';
import { logoutUser } from '../../features/auth/services/authService';
import { useAuthStore } from '../../store/authStore';
import type { AuthRole } from '../../types/auth';

// ---------------------------------------------------------------------------
// Nav item definition
// ---------------------------------------------------------------------------

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  /** null = always visible, true = only when logged in, false = only when logged out */
  requiresAuth: boolean | null;
  /** null = visible to any role, otherwise restricted to that JWT role */
  requiresRole: AuthRole | null;
}

const navItems: NavItem[] = [
  {
    path: '/home',
    label: 'Home',
    icon: LayoutDashboard,
    requiresAuth: null,
    requiresRole: null,
  },
  {
    path: '/login',
    label: 'Log in',
    icon: Shield,
    requiresAuth: false,
    requiresRole: null,
  },
  {
    path: '/map',
    label: 'Map',
    icon: Map,
    requiresAuth: true,
    requiresRole: null, // visible to both 'user' and 'admin'
  },
];

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // NOTE: JWT role is 'user' | 'admin'. App role (tourist/guide/author) comes
  // from the Stakeholders service — use that for UI gating, not this.
  const jwtRole = useAuthStore((s) => s.user?.role ?? null);

  const visibleItems = navItems.filter(({ requiresAuth, requiresRole }) => {
    if (requiresAuth === true && !isAuthenticated) return false;
    if (requiresAuth === false && isAuthenticated) return false;
    if (requiresRole !== null && jwtRole !== requiresRole) return false;
    return true;
  });

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