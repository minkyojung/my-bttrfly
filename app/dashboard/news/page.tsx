'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewsDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    classified: 0,
    posted: 0,
  });

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/articles');
      const data = await res.json();

      let filtered = data.articles || [];
      if (filter !== 'all') {
        filtered = filtered.filter((a: any) => a.status === filter);
      }

      setArticles(filtered);

      const allArticles = data.articles || [];
      setStats({
        total: allArticles.length,
        pending: allArticles.filter((a: any) => a.status === 'pending').length,
        classified: allArticles.filter((a: any) => a.status === 'classified').length,
        posted: allArticles.filter((a: any) => a.status === 'posted').length,
      });
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function classifyArticle(id: string) {
    try {
      const res = await fetch('/api/classify-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Classification failed:', error);
    }
  }

  async function runPipeline(step: string) {
    setLoading(true);
    try {
      const endpoints: Record<string, string> = {
        scrape: '/api/simple-scrape',
        classify: '/api/simple-classify',
        generate: '/api/cron/generate-instagram',
      };

      const res = await fetch(endpoints[step]);
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error(`Pipeline step ${step} failed:`, error);
    } finally {
      setLoading(false);
    }
  }

  const sentimentVariant = (sentiment: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (sentiment) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };

  const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'classified': return 'default';
      case 'posted': return 'default';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">News Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => runPipeline('scrape')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Scrape
            </Button>
            <Button
              onClick={() => runPipeline('classify')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Classify
            </Button>
            <Button
              onClick={() => runPipeline('generate')}
              disabled={loading}
              size="sm"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Classified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Posted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posted}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="classified">Classified</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No articles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {article.title?.substring(0, 80)}...
                          </a>
                        </TableCell>
                        <TableCell>
                          {article.category && (
                            <Badge variant="outline">{article.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {article.sentiment && (
                            <Badge variant={sentimentVariant(article.sentiment)}>
                              {article.sentiment}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(article.status)}>
                            {article.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {article.relevance_score || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(article.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {article.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => classifyArticle(article.id)}
                            >
                              Classify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>
                    Articles by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(articles.map(a => a.category).filter(Boolean))).map(cat => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm">{cat}</span>
                        <span className="text-sm font-mono text-muted-foreground">
                          {articles.filter(a => a.category === cat).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Overall sentiment breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Positive</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {articles.filter(a => a.sentiment === 'positive').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Neutral</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {articles.filter(a => a.sentiment === 'neutral').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Negative</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {articles.filter(a => a.sentiment === 'negative').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}