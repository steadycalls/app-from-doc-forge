import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Users,
  FolderKanban,
  TrendingUp,
  FileText,
  Webhook,
  BookOpen,
  Search,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/auth';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { Badge } from '@/components/ui/badge';

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'SOPs', href: '/sops', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { currentOrganization, canAccessSEO } = useOrganization();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  // Add SEO Research to navigation only for SitePanda
  const navigation = canAccessSEO()
    ? [...baseNavigation.slice(0, 7), { name: 'SEO Research', href: '/seo', icon: Search }, ...baseNavigation.slice(7)]
    : baseNavigation;

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="border-b border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: currentOrganization?.primary_color ? `${currentOrganization.primary_color}20` : 'hsl(var(--primary) / 0.1)' }}
          >
            {currentOrganization?.icon || <Building2 className="h-6 w-6" style={{ color: currentOrganization?.primary_color || undefined }} />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{currentOrganization?.name || 'Unified Ops'}</h1>
            {currentOrganization?.tagline && (
              <p className="text-xs text-muted-foreground truncate">{currentOrganization.tagline}</p>
            )}
          </div>
        </div>
        <OrganizationSwitcher />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary pl-2.5'
                  : 'text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-2">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            {currentOrganization && (
              <Badge variant={currentOrganization.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {currentOrganization.role}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
