import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getComments, getPosts, getSettings } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';
import CommentSection from '@/components/CommentSection';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { Calendar, Tag } from 'lucide-react';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    const postSlugs = posts.map((p) => ({ slug: p.slug }));
    const defaultCats = ['notification', 'answer-key', 'admit-card', 'result', 'syllabus'];
    const catSet = new Set<string>(defaultCats);
    posts.forEach((p) => {
      if (p.category) {
        catSet.add(categoryToSlug(p.category));
      }
    });
    const catSlugs = Array.from(catSet).map((slug) => ({ slug }));
    return [...catSlugs, ...postSlugs];
  } catch (err) {
    console.error('Error generating static params for [slug]:', err);
    return [
      { slug: 'notification' },
      { slug: 'answer-key' },
      { slug: 'admit-card' },
      { slug: 'result' },
      { slug: 'syllabus' },
    ];
  }
}

const POSTS_PER_PAGE = 5;

interface SlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_MAP: Record<string, string> = {
  'notification': 'Notification',
  'answer-key': 'Answer Key',
  'admit-card': 'Admit Card',
  'result': 'Result',
  'syllabus': 'Syllabus',
};

export async function generateMetadata({ params }: SlugPageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const cleanSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  // Check if it's a category
  if (CATEGORY_MAP[cleanSlug]) {
    const catName = CATEGORY_MAP[cleanSlug];
    return {
      title: `${catName} - RRB Group D Answer Key 2026`,
      description: `Browse latest ${catName} updates and official notices.`,
    };
  }

  // Check if it's a dynamic category from settings
  try {
    const settings = await getSettings();
    const allCatNames = (settings.site_categories || 'Notification,Answer Key,Admit Card,Result,Syllabus')
      .split(',').map((c: string) => c.trim()).filter(Boolean);
    const matchedCat = allCatNames.find((c: string) => categoryToSlug(c) === cleanSlug);
    if (matchedCat) {
      return {
        title: `${matchedCat} - RRB Group D Answer Key 2026`,
        description: `Browse latest ${matchedCat} updates and official notices.`,
      };
    }
  } catch {
    // ignore
  }

  // Check if it's a single post
  const post = await getPostBySlug(cleanSlug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} - RRB Group D Answer Key`,
    description: post.excerpt || post.title,
  };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const cleanSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  if (!cleanSlug) {
    notFound();
  }

  const allPosts = await getPosts();
  const settings = await getSettings();
  const showAds = settings.ads_status === '1';

  const recentPosts = [...allPosts].slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Build category list from settings, filter out hidden ones
  const allCatNames = (settings.site_categories || 'Notification,Answer Key,Admit Card,Result,Syllabus')
    .split(',').map((c: string) => c.trim()).filter(Boolean);
  const hiddenCatNames = (settings.hidden_categories || '')
    .split(',').map((c: string) => c.trim().toLowerCase()).filter(Boolean);
  const visibleCatList = allCatNames.filter((c: string) => !hiddenCatNames.includes(c.toLowerCase()));

  const categories = visibleCatList.map((cat: string) => {
    const count = allPosts.filter((p) => categoryToSlug(p.category) === categoryToSlug(cat)).length;
    return { category: cat, count };
  });

  // --------------------------------------------------------------------------
  // CASE 1: ROOT LEVEL CATEGORY PAGE (e.g. /notification, /syllabus)
  // --------------------------------------------------------------------------
  const isCategory = CATEGORY_MAP[cleanSlug] || allCatNames.some((c: string) => categoryToSlug(c) === cleanSlug);

  if (isCategory) {
    const categoryPosts = await getPosts({ category: cleanSlug });
    const samplePost = categoryPosts[0];
    const displayTitle = samplePost
      ? samplePost.category
      : (CATEGORY_MAP[cleanSlug] || cleanSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

    const totalPosts = categoryPosts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const currentPosts = categoryPosts.slice(0, POSTS_PER_PAGE);

    return (
      <div className="container">
        <div className="blog-layout">
          <div className="content-area">
            <div className="section-head">
              <h2 className="section-title">Category: {displayTitle}</h2>
            </div>

            <div id="blog-entries">
              {currentPosts.length === 0 ? (
                <p style={{ padding: '20px 0', color: '#666' }}>No posts found in this category.</p>
              ) : (
                currentPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>

            <Pagination
              currentPage={1}
              totalPages={totalPages}
              baseUrl={`/${cleanSlug}`}
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

  // --------------------------------------------------------------------------
  // CASE 2: SINGLE ARTICLE PAGE (e.g. /rrb-technician-grade-1...)
  // --------------------------------------------------------------------------
  const post = await getPostBySlug(cleanSlug);
  if (!post) {
    notFound();
  }

  const comments = await getComments(post.id);

  const coverUrl = post.cover_image
    ? post.cover_image.startsWith('/') || post.cover_image.startsWith('http')
      ? post.cover_image
      : `/${post.cover_image}`
    : '/uploads/default-cover.jpg';

  const tagsList = post.tags
    ? post.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="container">
      <div className="blog-layout">
        
        {/* Main Content Area */}
        <div className="content-area">
          <article className="article-wrap">
            <header className="article-header">
              <div className="article-cats">
                <Link
                  href={`/${categoryToSlug(post.category)}`}
                  className="article-cat-tag"
                >
                  {post.category}
                </Link>
              </div>

              <h1 className="article-title">{post.title}</h1>

              <div className="article-meta">
                <span className="byline">by {post.author_name || 'Mangal'}</span>
                <span className="posted-on flex items-center gap-1">
                  <Calendar style={{ width: '14px', height: '14px' }} />{' '}
                  {post.created_at.split(' ')[0]}
                </span>
              </div>

              {post.cover_image && (
                <img
                  src={coverUrl}
                  alt={post.title}
                  className="article-cover"
                />
              )}
            </header>

            {/* Article Content */}
            <div
              className="article-body article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags Section */}
            {tagsList.length > 0 && (
              <div className="article-tags flex items-center gap-2 wrap" style={{ marginTop: '24px', padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <span className="flex items-center gap-1 font-semibold text-gray-700" style={{ fontSize: '0.9rem', color: '#475569', marginRight: '6px' }}>
                  <Tag style={{ width: '15px', height: '15px' }} /> Tags:
                </span>
                {tagsList.map((t, idx) => (
                  <Link
                    key={idx}
                    href={`/blogs?q=${encodeURIComponent(t)}`}
                    className="tag-badge"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.825rem',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      fontWeight: 500,
                      border: '1px solid #cbd5e1',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Bar */}
            <div className="share-bar">
              <span className="share-label">Share:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn share-wa"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn share-tg"
              >
                Telegram
              </a>
            </div>

            {/* Comments Section */}
            <CommentSection postId={post.id} initialComments={comments} />
          </article>
        </div>

        {/* Sidebar */}
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
