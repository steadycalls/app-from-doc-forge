import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';

export const OrganizationSelector = () => {
  const navigate = useNavigate();
  const { userOrganizations, switchOrganization, currentOrganization, isLoading } = useOrganization();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    // If already has a current organization, redirect to dashboard
    if (currentOrganization && !isLoading) {
      navigate('/dashboard');
    }
  }, [currentOrganization, isLoading, navigate]);

  const handleSelectOrganization = () => {
    if (selectedOrgId) {
      switchOrganization(selectedOrgId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Select Your Organization</h1>
          <p className="text-muted-foreground">Choose which organization you'd like to access</p>
        </div>

        <div className="grid gap-4">
          {userOrganizations.map((org) => (
            <Card
              key={org.id}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedOrgId === org.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedOrgId(org.id)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: `${org.primary_color}20` }}
                >
                  {org.icon || <Building2 className="h-6 w-6" style={{ color: org.primary_color || undefined }} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{org.name}</h3>
                    <Badge variant={org.role === 'admin' ? 'default' : 'secondary'}>
                      {org.role}
                    </Badge>
                  </div>
                  {org.tagline && (
                    <p className="text-sm text-muted-foreground">{org.tagline}</p>
                  )}
                  {org.domain && (
                    <p className="text-xs text-muted-foreground mt-1">{org.domain}</p>
                  )}
                </div>
                {selectedOrgId === org.id && (
                  <ArrowRight className="h-5 w-5 text-primary" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={handleSelectOrganization}
            disabled={!selectedOrgId}
            size="lg"
            className="min-w-[200px]"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
