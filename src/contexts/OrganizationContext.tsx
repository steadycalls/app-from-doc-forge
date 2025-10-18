import { createContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  icon: string | null;
  tagline: string | null;
  settings: Record<string, any> | null;
}

interface UserOrganization extends Organization {
  role: 'admin' | 'member' | 'viewer';
}

interface OrganizationContextType {
  currentOrganization: UserOrganization | null;
  userOrganizations: UserOrganization[];
  isLoading: boolean;
  switchOrganization: (organizationId: string) => void;
  hasOrgAccess: (organizationId: string) => boolean;
  isAdmin: () => boolean;
  canAccessSEO: () => boolean;
  refreshOrganizations: () => Promise<void>;
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const STORAGE_KEY = 'current_organization_id';

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch user's organizations with their roles
      const { data: userOrgs, error } = await supabase
        .from('user_organizations')
        .select(`
          role,
          organization_id,
          organizations (
            id,
            name,
            slug,
            domain,
            logo_url,
            primary_color,
            icon,
            tagline,
            settings
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const organizations: UserOrganization[] = userOrgs?.map((uo: any) => ({
        id: uo.organizations.id,
        name: uo.organizations.name,
        slug: uo.organizations.slug,
        domain: uo.organizations.domain,
        logo_url: uo.organizations.logo_url,
        primary_color: uo.organizations.primary_color,
        icon: uo.organizations.icon,
        tagline: uo.organizations.tagline,
        settings: uo.organizations.settings,
        role: uo.role,
      })) || [];

      setUserOrganizations(organizations);

      // Set current organization from localStorage or default to first
      const savedOrgId = localStorage.getItem(STORAGE_KEY);
      const selectedOrg = savedOrgId 
        ? organizations.find(org => org.id === savedOrgId)
        : organizations[0];

      if (selectedOrg) {
        setCurrentOrganization(selectedOrg);
        localStorage.setItem(STORAGE_KEY, selectedOrg.id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrganizations();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchUserOrganizations();
      } else if (event === 'SIGNED_OUT') {
        setCurrentOrganization(null);
        setUserOrganizations([]);
        localStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchOrganization = (organizationId: string) => {
    const org = userOrganizations.find(o => o.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem(STORAGE_KEY, org.id);
      // Refresh the page to reload data for new organization
      navigate(0);
    }
  };

  const hasOrgAccess = (organizationId: string): boolean => {
    return userOrganizations.some(org => org.id === organizationId);
  };

  const isAdmin = (): boolean => {
    return currentOrganization?.role === 'admin';
  };

  const canAccessSEO = (): boolean => {
    return currentOrganization?.slug === 'sitepanda';
  };

  const refreshOrganizations = async () => {
    setIsLoading(true);
    await fetchUserOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        userOrganizations,
        isLoading,
        switchOrganization,
        hasOrgAccess,
        isAdmin,
        canAccessSEO,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
