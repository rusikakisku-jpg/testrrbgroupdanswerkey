'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Post } from '@/lib/types';
import { categoryToSlug } from '@/lib/utils';

interface CategoryItem {
  category: string;
  count: number;
}

interface SidebarProps {
  recentPosts?: Post[];
  popularPosts?: Post[];
  categories?: CategoryItem[];
  showAds?: boolean;
  showCalcWidget?: boolean;
  showSearchWidget?: boolean;
  hiddenCategories?: string; // comma-separated e.g. "Answer Key, Admit Card, Result"
}

export default function Sidebar({
  recentPosts = [],
  popularPosts = [],
  categories = [],
  showAds = false,
  showCalcWidget = true,
  showSearchWidget = true,
  hiddenCategories = '',
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Dynamic live state initialized with server/build-time props
  const [liveRecentPosts, setLiveRecentPosts] = useState<Post[]>(recentPosts);
  const [livePopularPosts, setLivePopularPosts] = useState<Post[]>(popularPosts);
  const [liveCategories, setLiveCategories] = useState<CategoryItem[]>(categories);
  const [liveHiddenCategories, setLiveHiddenCategories] = useState(hiddenCategories);
  const [liveShowAds, setLiveShowAds] = useState(showAds);

  // Sync with live database in the background on client mount
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';

    // 1. Live settings sync (ads_status, hidden_categories, site_categories)
    fetch(`${apiBase}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (!settings) return;
        if (settings.ads_status !== undefined) {
          setLiveShowAds(settings.ads_status === '1');
        }
        if (settings.hidden_categories !== undefined) {
          setLiveHiddenCategories(settings.hidden_categories);
        }
        if (settings.site_categories) {
          const catNames = settings.site_categories
            .split(',')
            .map((c: string) => c.trim())
            .filter(Boolean);
          if (catNames.length > 0) {
            setLiveCategories((prev) => {
              return catNames.map((name: string) => {
                const found = prev.find((p) => p.category.toLowerCase() === name.toLowerCase());
                return found ? found : { category: name, count: 0 };
              });
            });
          }
        }
      })
      .catch(() => {});

    // 2. Live categories post counts sync
    fetch(`${apiBase}/api/categories`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setLiveCategories((prev) => {
            const map = new Map<string, number>();
            cats.forEach((c: { category: string; count: number }) => {
              if (c.category) map.set(c.category.toLowerCase(), c.count);
            });
            const updated = prev.map((item) => ({
              ...item,
              count: map.has(item.category.toLowerCase()) ? map.get(item.category.toLowerCase())! : item.count,
            }));
            cats.forEach((c: { category: string; count: number }) => {
              if (!updated.some((u) => u.category.toLowerCase() === c.category.toLowerCase())) {
                updated.push({ category: c.category, count: c.count });
              }
            });
            return updated;
          });
        }
      })
      .catch(() => {});

    // 3. Live posts sync (recent & popular posts)
    fetch(`${apiBase}/api/posts?limit=10`)
      .then((res) => (res.ok ? res.json() : null))
      .then((posts) => {
        if (Array.isArray(posts) && posts.length > 0) {
          setLiveRecentPosts(posts.slice(0, 5));
          const sorted = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
          setLivePopularPosts(sorted);
        }
      })
      .catch(() => {});
  }, []);

  // Parse hidden categories from live settings and filter them out
  const hiddenList = liveHiddenCategories
    ? liveHiddenCategories.split(',').map((c) => c.trim().toLowerCase())
    : [];
  const visibleCategories = liveCategories.filter(
    (cat) => !hiddenList.includes(cat.category.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/blogs?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getCoverUrl = (cover_image?: string | null) => {
    if (!cover_image) return '/uploads/default-cover.jpg';
    return cover_image.startsWith('/') || cover_image.startsWith('http')
      ? cover_image
      : `/${cover_image}`;
  };

  return (
    <aside className="sidebar">
      

      {/* Search Widget */}
      {showSearchWidget && (
        <div className="widget widget-search">
          <h3 className="widget-title">Search</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="search"
              className="search-input"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Submit Search">
              <Search style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        </div>
      )}

      {/* Ad Widget 300x250 (Only rendered if showAds is true) */}
      {liveShowAds && (
        <div className="widget widget-ad">
          <div className="ad-card-300">
            <div className="ad-title">Google AdSense</div>
            <div className="ad-size">300x250</div>
          </div>
        </div>
      )}

      {/* Recent Posts Widget */}
      {liveRecentPosts.length > 0 && (
        <div className="widget widget-popular">
          <h3 className="widget-title">Recent Posts</h3>
          <ul className="popular-posts-list">
            {liveRecentPosts.map((post) => (
              <li key={post.id} className="popular-item">
                <Link href={`/${post.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                  <img
                    src={getCoverUrl(post.cover_image)}
                    alt={post.title}
                    className="popular-thumb"
                    style={{ width: '80px', height: '55px', objectFit: 'cover', objectPosition: 'center', borderRadius: '6px', display: 'block' }}
                  />
                </Link>
                <div className="popular-info">
                  <Link href={`/${post.slug}`} className="popular-title-link">
                    {post.title}
                  </Link>
                  <span className="popular-date">{post.created_at.split(' ')[0]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Posts Widget */}
      {livePopularPosts.length > 0 && (
        <div className="widget widget-popular">
          <h3 className="widget-title">Popular Posts</h3>
          <ul className="popular-posts-list">
            {livePopularPosts.map((post) => (
              <li key={post.id} className="popular-item">
                <Link href={`/${post.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                  <img
                    src={getCoverUrl(post.cover_image)}
                    alt={post.title}
                    className="popular-thumb"
                    style={{ width: '80px', height: '55px', objectFit: 'cover', objectPosition: 'center', borderRadius: '6px', display: 'block' }}
                  />
                </Link>
                <div className="popular-info">
                  <Link href={`/${post.slug}`} className="popular-title-link">
                    {post.title}
                  </Link>
                  <span className="popular-date">{post.created_at.split(' ')[0]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories Widget — only shown when there are visible categories */}
      {visibleCategories.length > 0 && (
        <div className="widget widget-categories">
          <h3 className="widget-title">Categories</h3>
          <ul className="cat-list">
            {visibleCategories.map((cat) => (
              <li key={cat.category} className="cat-item">
                <Link href={`/${categoryToSlug(cat.category)}`} className="cat-link">
                  <span>{cat.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

    </aside>
  );
}
