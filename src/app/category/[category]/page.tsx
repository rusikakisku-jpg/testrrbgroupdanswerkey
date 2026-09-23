import React from 'react';
import type { Metadata } from 'next';
import { getPosts } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';

export const dynamic = 'force-static';

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
  } catch {
    return defaultCats.map((category) => ({ category }));
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';
  return {
    title: `Redirecting to /${categorySlug}/...`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${baseUrl}/${categorySlug}/`,
    },
    other: {
      refresh: `0; url=/${categorySlug}/`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const rawCat = resolvedParams?.category || '';
  const categorySlug = decodeURIComponent(rawCat).trim().toLowerCase();
  const targetUrl = `/${categorySlug}/`;

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
