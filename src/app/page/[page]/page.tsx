import React from 'react';
import { notFound } from 'next/navigation';
import { getPosts, getSettings, categoryToSlug } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-static';

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, i) => ({
      page: String(i + 1),
    }));
  } catch (err) {
    console.error('Error generating static params for page/[page]:', err);
    return [{ page: '1' }];
  }
}

interface PageRouteProps {
  params: Promise<{
    page: string;
  }>;
}

export async function generateMetadata({ params }: PageRouteProps) {
  const resolvedParams = await params;
  const pageNum = parseInt(resolvedParams?.page || '1', 10);
  return {
    title: `RRB Group D Answer Key - Page ${pageNum}`,
    description: `Browse latest posts and exam updates on Page ${pageNum}.`,
  };
}

export default async function HomePagePaginated({ params }: PageRouteProps) {
  const resolvedParams = await params;
  const currentPage = parseInt(resolvedParams?.page || '1', 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const allPosts = await getPosts();
  const settings = await getSettings();
  const showAds = settings.ads_status === '1';

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const recentPosts = allPosts.slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const categoriesList = ['Notification', 'Answer Key', 'Admit Card', 'Result', 'Syllabus'];
  const categories = categoriesList.map((cat) => {
    const count = allPosts.filter((p) => categoryToSlug(p.category) === categoryToSlug(cat)).length;
    return { category: cat, count };
  });

  return (
    <div className="container">
      <div className="blog-layout">
        
        {/* Main Content Area */}
        <div className="content-area">
          <div className="section-head">
            <h2 className="section-title">Latest Posts (Page {currentPage})</h2>
          </div>

          <div id="blog-entries">
            {currentPosts.length === 0 ? (
              <p style={{ padding: '20px 0', color: '#666' }}>No published posts found.</p>
            ) : (
              currentPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="" />
        </div>

        {/* Sidebar */}
        <Sidebar
          recentPosts={recentPosts}
          popularPosts={popularPosts}
          categories={categories}
          showAds={showAds}
        />

      </div>
    </div>
  );
}
