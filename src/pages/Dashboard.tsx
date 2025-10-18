import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const clients = storage.get(STORAGE_KEYS.CLIENTS) || [];
  const projects = storage.get(STORAGE_KEYS.PROJECTS) || [];
  const opportunities = storage.get(STORAGE_KEYS.OPPORTUNITIES) || [];

  const stats = [
    {
      title: 'Total Clients',
      value: Array.isArray(clients) ? clients.length : 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Projects',
      value: Array.isArray(projects) ? projects.filter((p: any) => p.status === 'active').length : 0,
      icon: FolderKanban,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Opportunities',
      value: Array.isArray(opportunities) ? opportunities.length : 0,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Pipeline Value',
      value: Array.isArray(opportunities) 
        ? `$${opportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0).toLocaleString()}`
        : '$0',
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
          <p className="text-muted-foreground">Welcome back! Here's your operations overview.</p>
        </div>

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
