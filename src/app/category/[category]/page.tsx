import React from 'react';
import { getPosts, getSettings } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

export const revalidate = 0;

export async function generateStaticParams() {
  const defaultCats = ['notification', 'answer-key', 'admit-card', 'result', 'syllabus'];
  try {
    const posts = await getPosts();
    const catSet = new Set<string>(defaultCats);
    posts.forEach((p) => {
      if (p.category) {
        catSet.add(categoryToSlug(p.category));
      }
    });
    return Array.from(catSet).map((category) => ({ category }));
  } catch (err) {
    console.error('Error generating static params for category:', err);
    return defaultCats.map((category) => ({ category }));
  }
}

const POSTS_PER_PAGE = 5;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10));
  
  const categoryPosts = await getPosts({ category: categorySlug });
  const settings = await getSettings();
  const showAds = settings.ads_status === '1';

  const totalPosts = categoryPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = categoryPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Display human-readable title
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
              Category: {displayTitle} {currentPage > 1 ? `(Page ${currentPage})` : ''}
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
