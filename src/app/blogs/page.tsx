import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPosts, getSettings } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';
import BlogsClient from './BlogsClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'All Exam Updates & Search - RRB Group D Portal',
  description:
    'Search through all latest Railway Recruitment Board (RRB) notifications, answer keys, results, and syllabus articles.',
  alternates: {
    canonical: '/blogs/',
  },
};

export default async function BlogsPage() {
  const allPosts = await getPosts();
  const settings = await getSettings();

  const recentPosts = [...allPosts].slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const allCatNames = (settings.site_categories || 'Notification,Answer Key,Admit Card,Result,Syllabus')
    .split(',')
    .map((c: string) => c.trim())
    .filter(Boolean);
  const hiddenCatNames = (settings.hidden_categories || '')
    .split(',')
    .map((c: string) => c.trim().toLowerCase())
    .filter(Boolean);
  const visibleCatList = allCatNames.filter((c: string) => !hiddenCatNames.includes(c.toLowerCase()));

  const categories = visibleCatList.map((cat: string) => {
    const count = allPosts.filter((p) => categoryToSlug(p.category) === categoryToSlug(cat)).length;
    return { category: cat, count };
  });

  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>Loading posts...</p>
        </div>
      }
    >
      <BlogsClient
        initialPosts={allPosts}
        settings={settings}
        categories={categories}
        recentPosts={recentPosts}
        popularPosts={popularPosts}
      />
    </Suspense>
  );
}
