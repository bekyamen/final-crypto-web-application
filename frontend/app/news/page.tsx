'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Calendar } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  url: string;
  source: string;
  image: string;
}

const PAGE_SIZE = 20;

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const fetchNews = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/crypto-news');
      if (!res.ok) throw new Error('Failed to fetch news');

      const data: { success: boolean; news: NewsArticle[] } = await res.json();
      if (!data.success) throw new Error('Invalid response');

      // Deduplicate
      const existingKeys = new Set(news.map(n => `${n.url}-${n.timestamp}`));
      const newUniqueNews = data.news.filter(
        n => !existingKeys.has(`${n.url}-${n.timestamp}`)
      );

      const start = (page - 1) * PAGE_SIZE;
      const pageItems = newUniqueNews.slice(start, start + PAGE_SIZE);

      setNews(prev => [...prev, ...pageItems]);
      setHasMore(pageItems.length === PAGE_SIZE);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setError('Unable to load crypto news');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, news, page]);

  /* ---------------- Infinite Scroll ---------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNews();
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchNews]);

  /* ---------------- Search ---------------- */
  const filteredNews = searchQuery
    ? news.filter(
        n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : news;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-700/50 sticky top-0 z-40 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-lg">Crypto News</h1>
            <p className="text-slate-400 text-sm">
              Stay updated with the latest cryptocurrency news and insights
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-16 pt-6">
        {filteredNews.map((article, index) => (
          <div
            key={`${article.url}-${article.timestamp}-${index}`}
            className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 mb-4 hover:border-slate-600/50 transition"
          >
            <div className="flex gap-4">
              {article.image && (
                <img
                  src={article.image}
                  className="w-32 h-24 object-cover rounded-lg"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}

              <div className="flex-1">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold text-lg hover:text-blue-400"
                >
                  {article.title}
                </a>

                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{article.description}</p>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(article.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && <div className="text-center text-slate-400 py-6">Loading more news...</div>}
        {!hasMore && news.length > 0 && <div className="text-center text-slate-500 py-6">No more articles</div>}
        {error && <div className="text-center text-yellow-400 py-6">{error}</div>}
        <div ref={observerTarget} />
      </main>
    </div>
  );
}
