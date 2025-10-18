import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, DollarSign, Target } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  competition: string;
}

const SEOKeywords = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);

  const generateMockKeywords = (seedKeyword: string, niche: string): KeywordData[] => {
    const variations = [
      seedKeyword,
      `${seedKeyword} near me`,
      `best ${seedKeyword}`,
      `${seedKeyword} services`,
      `affordable ${seedKeyword}`,
      `${niche} ${seedKeyword}`,
      `${seedKeyword} cost`,
      `${seedKeyword} reviews`,
    ];

    return variations.map((keyword) => ({
      keyword,
      volume: Math.floor(Math.random() * 5000) + 500,
      difficulty: Math.floor(Math.random() * 100),
      cpc: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const seedKeyword = formData.get('keyword') as string;
      const niche = formData.get('niche') as string;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = generateMockKeywords(seedKeyword, niche);
      setKeywords(mockData);
      toast.success('Keyword research completed');
    } catch (error) {
      toast.error('Failed to fetch keywords');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-success';
    if (difficulty < 60) return 'text-warning';
    return 'text-destructive';
  };

  const avgVolume = keywords.length > 0 
    ? Math.round(keywords.reduce((sum, k) => sum + k.volume, 0) / keywords.length) 
    : 0;

  const avgDifficulty = keywords.length > 0 
    ? Math.round(keywords.reduce((sum, k) => sum + k.difficulty, 0) / keywords.length) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Keyword Research</h1>
          <p className="text-muted-foreground">
            Discover high-value keywords with search volume and competition metrics
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="border-border/50 h-fit sticky top-6">
            <CardHeader>
              <CardTitle>Research Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword">Seed Keyword</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="keyword"
                      name="keyword"
                      placeholder="plumber"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niche">Business Niche</Label>
                  <Input
                    id="niche"
                    name="niche"
                    placeholder="home services"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Los Angeles, CA"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Researching...' : 'Research Keywords'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {keywords.length > 0 && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{avgVolume.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{avgDifficulty}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Keywords Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{keywords.length}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Keyword Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {keywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{keyword.keyword}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {keyword.volume.toLocaleString()} /mo
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${keyword.cpc} CPC
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {keyword.competition} competition
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getDifficultyColor(keyword.difficulty)}`}
                          >
                            {keyword.difficulty} difficulty
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {keywords.length === 0 && (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter a seed keyword to start your research
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SEOKeywords;
