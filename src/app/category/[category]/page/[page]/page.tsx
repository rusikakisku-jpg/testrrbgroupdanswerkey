import React from 'react';
import { notFound } from 'next/navigation';
import { getPosts, getSettings } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-static';

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  const defaultCats = ['notification', 'answer-key', 'admit-card', 'result', 'syllabus'];
  try {
    const posts = await getPosts();
    const catCounts: Record<string, number> = {};
    defaultCats.forEach((c) => {
      catCounts[c] = 0;
    });

    posts.forEach((p) => {
      if (p.category) {
        const slug = categoryToSlug(p.category);
        catCounts[slug] = (catCounts[slug] || 0) + 1;
      }
    });

    const params: Array<{ category: string; page: string }> = [];
    Object.entries(catCounts).forEach(([category, count]) => {
      const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
      for (let i = 1; i <= totalPages; i++) {
        params.push({ category, page: String(i) });
      }
    });
    return params;
  } catch (err) {
    console.error('Error generating static params for category/[category]/page/[page]:', err);
    const pages = ['1', '2', '3'];
    const params: Array<{ category: string; page: string }> = [];
    defaultCats.forEach((category) => {
      pages.forEach((page) => {
        params.push({ category, page });
      });
    });
    return params;
  }
}

interface CategoryPaginatedProps {
  params: Promise<{
    category: string;
    page: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPaginatedProps) {
  const resolvedParams = await params;
  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const pageNum = parseInt(resolvedParams?.page || '1', 10);
  const displayTitle = categorySlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';
  const url = `${baseUrl}/category/${categorySlug}/page/${pageNum}/`;

  return {
    title: `${displayTitle} Updates 2026 - Page ${pageNum} | RRB Group D`,
    description: `Read latest ${displayTitle} notifications and updates on Page ${pageNum}.`,
    alternates: {
      canonical: url,
    },
  };
}

export default async function CategoryPagePaginated({ params }: CategoryPaginatedProps) {
  const resolvedParams = await params;

  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const currentPage = parseInt(resolvedParams?.page || '1', 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const categoryPosts = await getPosts({ category: categorySlug });
  const settings = await getSettings();
  const showAds = settings.ads_status === '1';

  const totalPosts = categoryPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = categoryPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const samplePost = categoryPosts[0];
  const displayTitle = samplePost
    ? samplePost.category
    : categorySlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const allPosts = await getPosts();
  const recentPosts = [...allPosts].slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const defaultCatNames = ['Notification', 'Answer Key', 'Admit Card', 'Result', 'Syllabus'];
  const allCatNames = (settings.site_categories || defaultCatNames.join(','))
    .split(',')
    .map((c: string) => c.trim())
    .filter(Boolean);
  const categories = allCatNames.map((cat: string) => {
    const count = allPosts.filter((p) => categoryToSlug(p.category) === categoryToSlug(cat)).length;
    return { category: cat, count };
  });

  return (
    <div className="container">
      <div className="blog-layout">
        
        <div className="content-area">
          <div className="section-head">
            <h2 className="section-title">
              Category: {displayTitle} (Page {currentPage})
            </h2>
          </div>

          <div id="blog-entries">
            {currentPosts.length === 0 ? (
              <p style={{ padding: '20px 0', color: '#666' }}>No posts found in this category.</p>
            ) : (
              currentPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/category/${categorySlug}`}
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
