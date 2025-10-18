import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, FileText, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEO = () => {
  const tools = [
    {
      name: 'Keyword Research',
      description: 'Find high-value keywords with search volume and difficulty metrics',
      icon: Search,
      href: '/seo/keywords',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      name: 'Competitor Analysis',
      description: 'Analyze top-ranking competitors and their SEO strategies',
      icon: TrendingUp,
      href: '/seo/competitors',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      name: 'Site Plans',
      description: 'Create comprehensive website structure and content blueprints',
      icon: FileText,
      href: '/seo/site-plans',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      name: 'Content Generation',
      description: 'Generate SEO-optimized content for multiple page types',
      icon: Lightbulb,
      href: '/seo/content',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">SEO Research & Tools</h1>
          <p className="text-muted-foreground">
            Comprehensive SEO tools for keyword research, competitor analysis, and content generation
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.name} to={tool.href}>
              <Card className="border-border/50 hover:border-primary/50 transition-all h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                      <tool.icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle>About SEO Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              These integrated SEO tools help you research keywords, analyze competitors, plan site
              structure, and generate optimized content for your websites.
            </p>
            <p>
              Currently using mock data for demonstration. Connect to DataForSEO API for real
              keyword data and search volume metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SEO;
