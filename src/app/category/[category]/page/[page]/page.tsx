import React from 'react';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';

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

export async function generateMetadata({ params }: CategoryPaginatedProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const pageNum = resolvedParams?.page || '1';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';
  const targetCanonical = pageNum === '1' ? `${baseUrl}/${categorySlug}/` : `${baseUrl}/${categorySlug}/page/${pageNum}/`;
  const targetUrl = pageNum === '1' ? `/${categorySlug}/` : `/${categorySlug}/page/${pageNum}/`;

  return {
    title: `Redirecting to /${categorySlug}/...`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: targetCanonical,
    },
    other: {
      refresh: `0; url=${targetUrl}`,
    },
  };
}

export default async function CategoryPagePaginated({ params }: CategoryPaginatedProps) {
  const resolvedParams = await params;
  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const pageNum = resolvedParams?.page || '1';
  const targetUrl = pageNum === '1' ? `/${categorySlug}/` : `/${categorySlug}/page/${pageNum}/`;

  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
        Redirecting to{' '}
        <a href={targetUrl} style={{ color: '#0284c7', fontWeight: 600 }}>
          {targetUrl}
        </a>
        ...
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace("${targetUrl}");`,
        }}
      />
    </div>
  );
}
