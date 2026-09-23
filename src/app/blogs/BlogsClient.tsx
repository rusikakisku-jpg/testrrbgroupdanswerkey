'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Post } from '@/lib/types';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

const POSTS_PER_PAGE = 5;

interface BlogsClientProps {
  initialPosts: Post[];
  settings: Record<string, string>;
  categories: { category: string; count: number }[];
  recentPosts: Post[];
  popularPosts: Post[];
}

export default function BlogsClient({
  initialPosts,
  settings,
  categories,
  recentPosts,
  popularPosts,
}: BlogsClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10));

  const [livePosts, setLivePosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(false);

  // When query is active, fetch from live API endpoint in background to catch any newest posts
  useEffect(() => {
    if (!query.trim()) {
      setLivePosts(null);
      return;
    }

    let isMounted = true;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';
    setLoading(true);

    fetch(`${apiBase}/api/posts?q=${encodeURIComponent(query.trim())}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setLivePosts(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  // Client-side fallback filter on initialPosts for instant 0ms response
  const filteredPosts = useMemo(() => {
    if (!query.trim()) return initialPosts;
    if (livePosts !== null) return livePosts;

    const q = query.trim().toLowerCase();
    return initialPosts.filter((post) => {
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
      const matchCategory = post.category?.toLowerCase().includes(q);
      const matchTags = post.tags?.toLowerCase().includes(q);
      const matchContent = post.content?.toLowerCase().includes(q);
      return matchTitle || matchExcerpt || matchCategory || matchTags || matchContent;
    });
  }, [initialPosts, query, livePosts]);

  const showAds = settings.ads_status === '1';
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const baseUrl = query ? `/blogs?q=${encodeURIComponent(query)}` : '/blogs';

  return (
    <div className="container">
      <div className="blog-layout">
        <div className="content-area">
          <div className="section-head">
            <h2 className="section-title">
              {query
                ? `Search Results for "${query}"`
                : 'All Posts'}{' '}
              {currentPage > 1 ? `(Page ${currentPage})` : ''}
            </h2>
          </div>

          <div id="blog-entries">
            {loading && filteredPosts.length === 0 ? (
              <p style={{ padding: '20px 0', color: '#666' }}>Searching articles...</p>
            ) : currentPosts.length === 0 ? (
              <p style={{ padding: '20px 0', color: '#666' }}>
                No posts found matching your search.
              </p>
            ) : (
              currentPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>

        <Sidebar
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          categories={categories}
          showAds={showAds}
          hiddenCategories={settings.hidden_categories || ''}
        />
      </div>
    </div>
  );
}
