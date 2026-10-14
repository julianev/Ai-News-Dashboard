import { useState, useMemo } from 'react';
import type { ModelRelease } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Trophy, ExternalLink, Cpu, DollarSign, BookOpen, Scale, Search, ArrowUpDown } from 'lucide-react';

interface Props {
  models: ModelRelease[];
  loading: boolean;
}

type SortKey = 'releaseDate' | 'contextLength' | 'inputPrice' | 'outputPrice';

const LEADERBOARD_LINKS = [
  { name: 'LMArena (Chatbot Arena)', description: 'Crowdsourced human-preference Elo rankings across chat models.', url: 'https://lmarena.ai/leaderboard', badge: 'Human Preference Elo', icon: Trophy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { name: 'Artificial Analysis', description: 'Quality index, $/token, and speed/latency across providers.', url: 'https://artificialanalysis.ai', badge: 'Quality · Cost · Speed', icon: Cpu, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Papers with Code', description: 'Academic SOTA tracking across research benchmarks over time.', url: 'https://paperswithcode.com/sota', badge: 'Academic SOTA', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { name: 'OpenRouter Models', description: 'Live pricing, context windows, and provider metadata (source of this board).', url: 'https://openrouter.ai/models', badge: 'Pricing & Metadata', icon: Scale, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
];

export function BenchmarksSection({ models, loading }: Props) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('releaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
  };

  const sorted = useMemo(() => {
    let result = [...models];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let valA: number, valB: number;
      if (sortBy === 'releaseDate') { valA = new Date(a.releaseDate).getTime(); valB = new Date(b.releaseDate).getTime(); }
      else { valA = a[sortBy]; valB = b[sortBy]; }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return result;
  }, [models, search, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <section id="benchmarks" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Model Releases
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Newest models from OpenRouter — pricing, context window, and provider. For capability rankings, see the leaderboards below.
        </p>
      </div>

      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Latest releases</CardTitle>
          <CardDescription className="text-xs">{sorted.length} models, newest first.</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search model or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-3 pl-4">Model</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('releaseDate')}>
                    <span className="flex items-center gap-1">Released <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('contextLength')}>
                    <span className="flex items-center gap-1">Context <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('inputPrice')}>
                    <span className="flex items-center gap-1">$/1M in <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('outputPrice')}>
                    <span className="flex items-center gap-1">$/1M out <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="p-3 pl-4">
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary flex items-center gap-1">
                        {m.name}
                        <ExternalLink className="h-3 w-3 opacity-40" />
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground">{m.provider}</td>
                    <td className="p-3 font-mono text-muted-foreground">{m.releaseDate ? new Date(m.releaseDate).toLocaleDateString() : '—'}</td>
                    <td className="p-3 font-mono text-muted-foreground">{m.contextLength ? m.contextLength.toLocaleString() : '—'}</td>
                    <td className="p-3 font-mono text-foreground">${m.inputPrice.toFixed(2)}</td>
                    <td className="p-3 font-mono text-foreground">${m.outputPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" /> Capability Leaderboards
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">External rankings for quality, Elo, and academic SOTA.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERBOARD_LINKS.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Card key={link.name} className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] py-0 border-none ${link.color}`}>{link.badge}</Badge>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-foreground hover:text-primary flex items-center gap-1">
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                  <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
