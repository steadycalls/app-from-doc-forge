import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, TrendingUp, DollarSign, ArrowUpRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { currentOrganization, userOrganizations } = useOrganization();

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', currentOrganization.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', currentOrganization.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization,
  });

  // Fetch opportunities
  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('organization_id', currentOrganization.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization,
  });

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Projects',
      value: projects.filter((p: any) => p.status === 'active').length,
      icon: FolderKanban,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Opportunities',
      value: opportunities.length,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pipeline Value',
      value: `$${opportunities.reduce((sum: number, opp: any) => sum + (Number(opp.value) || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  const quickActions = [
    { name: 'Manage Clients', href: '/clients', icon: Users },
    { name: 'View Projects', href: '/projects', icon: FolderKanban },
    { name: 'Track Opportunities', href: '/opportunities', icon: TrendingUp },
    { name: 'SEO Research', href: '/seo', icon: ArrowUpRight },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to {currentOrganization?.name || 'your organization'}! Here's your operations overview.
          </p>
        </div>

        {/* Organizations Overview */}
        {userOrganizations.length > 1 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userOrganizations.map((org) => (
                  <Card
                    key={org.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      org.id === currentOrganization?.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl flex-shrink-0"
                        style={{ backgroundColor: `${org.primary_color}20` }}
                      >
                        {org.icon || <Building2 className="h-5 w-5" style={{ color: org.primary_color || undefined }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">{org.name}</h3>
                          {org.id === currentOrganization?.id && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {org.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50 hover:border-primary/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.name} to={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-secondary/20">
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Application Status</span>
                <span className="flex items-center gap-2 text-sm font-medium text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Storage</span>
                <span className="flex items-center gap-2 text-sm font-medium text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Ready
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
