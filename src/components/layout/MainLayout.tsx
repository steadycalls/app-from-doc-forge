import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { auth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { currentOrganization, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await auth.isAuthenticated();
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      setIsChecking(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect to organization selector if no organization selected (but user is authenticated)
  useEffect(() => {
    if (!isChecking && !isOrgLoading && !currentOrganization && location.pathname !== '/select-organization') {
      navigate('/select-organization');
    }
  }, [isChecking, isOrgLoading, currentOrganization, navigate, location.pathname]);

  if (isChecking || isOrgLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};
