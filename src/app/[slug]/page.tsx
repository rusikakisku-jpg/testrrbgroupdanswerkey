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
import { sanitizeHtml } from '@/lib/sanitize';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
    const postSlugs = posts.map((p) => ({ slug: p.slug }));
    const defaultCats = ['notification', 'answer-key', 'admit-card', 'result', 'syllabus'];
    const catSet = new Set<string>(defaultCats);
    if (settings.site_categories) {
      settings.site_categories.split(',').forEach((c: string) => {
        const s = categoryToSlug(c);
        if (s) catSet.add(s);
      });
    }
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';

  // Check if it's a category
  if (CATEGORY_MAP[cleanSlug]) {
    const catName = CATEGORY_MAP[cleanSlug];
    const catUrl = `${baseUrl}/${cleanSlug}/`;
    const title = `${catName} - RRB Group D Official Updates 2026`;
    const description = `Browse latest official ${catName} updates, notices, exam dates and direct links for Railway Recruitment Board (RRB).`;
    return {
      title,
      description,
      alternates: { canonical: catUrl },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: catUrl,
        siteName: 'RRB Group D Answer Key 2026',
        title,
        description,
        images: [{ url: 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png'],
      },
    };
  }

  // Check if it's a dynamic category from settings
  try {
    const settings = await getSettings();
    const allCatNames = (settings.site_categories || 'Notification,Answer Key,Admit Card,Result,Syllabus')
      .split(',').map((c: string) => c.trim()).filter(Boolean);
    const matchedCat = allCatNames.find((c: string) => categoryToSlug(c) === cleanSlug);
    if (matchedCat) {
      const catUrl = `${baseUrl}/${cleanSlug}/`;
      const title = `${matchedCat} - RRB Group D Official Updates 2026`;
      const description = `Browse latest official ${matchedCat} updates, notices, exam dates and direct links for Railway Recruitment Board (RRB).`;
      return {
        title,
        description,
        alternates: { canonical: catUrl },
        openGraph: {
          type: 'website',
          locale: 'en_IN',
          url: catUrl,
          siteName: 'RRB Group D Answer Key 2026',
          title,
          description,
          images: [{ url: 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png', width: 1200, height: 630 }],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: ['https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png'],
        },
      };
    }
  } catch {
    // ignore
  }

  // Check if it's a single post
  const post = await getPostBySlug(cleanSlug);
  if (!post) return { title: 'Not Found' };

  const postUrl = `${baseUrl}/${cleanSlug}/`;
  const coverImage = post.cover_image
    ? (post.cover_image.startsWith('http') ? post.cover_image : `${baseUrl}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`)
    : 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png';
  const desc = post.excerpt ? post.excerpt.slice(0, 160) : post.title;

  return {
    title: post.title,
    description: desc,
    keywords: post.tags ? post.tags.split(',').map((t) => t.trim()) : undefined,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'en_IN',
      url: postUrl,
      siteName: 'RRB Group D Answer Key 2026',
      title: post.title,
      description: desc,
      publishedTime: post.created_at ? new Date(post.created_at.replace(' ', 'T')).toISOString() : undefined,
      authors: [post.author_name || 'Mangal'],
      section: post.category,
      tags: post.tags ? post.tags.split(',').map((t) => t.trim()) : undefined,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
      images: [coverImage],
    },
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';
    const catCanonicalUrl = `${baseUrl}/${cleanSlug}/`;

    const categoryBreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: displayTitle,
          item: catCanonicalUrl,
        },
      ],
    };

    return (
      <div className="container">
        <div className="blog-layout">
          <div className="content-area">
            {/* Breadcrumb Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryBreadcrumbSchema) }}
            />

            {/* Visual Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="breadcrumb-nav" style={{ marginBottom: '14px', fontSize: '0.85rem', color: '#64748b' }}>
              <Link href="/" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 6px', color: '#94a3b8' }}>/</span>
              <span style={{ color: '#64748b' }}>{displayTitle}</span>
            </nav>

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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';
  const fullCoverUrl = coverUrl.startsWith('http') ? coverUrl : `${baseUrl}${coverUrl}`;
  const postCanonicalUrl = `${baseUrl}/${cleanSlug}/`;
  const catSlug = categoryToSlug(post.category);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postCanonicalUrl,
    },
    headline: post.title,
    description: post.excerpt || post.title,
    image: [fullCoverUrl],
    author: {
      '@type': 'Person',
      name: post.author_name || 'Mangal',
    },
    publisher: {
      '@type': 'Organization',
      name: settings.site_title || 'RRB Group D Answer Key',
      logo: {
        '@type': 'ImageObject',
        url: settings.site_logo || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png',
      },
    },
    datePublished: post.created_at ? new Date(post.created_at.replace(' ', 'T')).toISOString() : new Date().toISOString(),
    dateModified: post.updated_at ? new Date(post.updated_at.replace(' ', 'T')).toISOString() : (post.created_at ? new Date(post.created_at.replace(' ', 'T')).toISOString() : new Date().toISOString()),
    articleSection: post.category,
    keywords: post.tags || undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.category,
        item: `${baseUrl}/${catSlug}/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postCanonicalUrl,
      },
    ],
  };

  return (
    <div className="container">
      <div className="blog-layout">
        
        {/* Main Content Area */}
        <div className="content-area">
          {/* JSON-LD Schemas */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />

          {/* Visual Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="breadcrumb-nav" style={{ marginBottom: '14px', fontSize: '0.85rem', color: '#64748b' }}>
            <Link href="/" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px', color: '#94a3b8' }}>/</span>
            <Link href={`/${catSlug}/`} style={{ color: '#0284c7', textDecoration: 'none' }}>{post.category}</Link>
            <span style={{ margin: '0 6px', color: '#94a3b8' }}>/</span>
            <span style={{ color: '#64748b' }}>{post.title.length > 35 ? `${post.title.slice(0, 35)}...` : post.title}</span>
          </nav>

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
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1200}
                  height={675}
                  style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
                />
              )}
            </header>

            {/* Article Content */}
            <div
              className="article-body article-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
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
