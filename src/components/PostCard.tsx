'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Post } from '@/lib/types';
import { categoryToSlug } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const coverUrl = post.cover_image
    ? post.cover_image.startsWith('/') || post.cover_image.startsWith('http')
      ? post.cover_image
      : `/${post.cover_image}`
    : '/uploads/default-cover.jpg';

  const categorySlug = categoryToSlug(post.category);

  return (
    <article className="hm-entry">
      
      {/* Thumbnail */}
      <div className="post-thumbnail">
        <Link href={`/${post.slug}`}>
          <img
            src={coverUrl}
            alt={post.title}
            loading="lazy"
            decoding="async"
            width={640}
            height={360}
            style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
          />
        </Link>
      </div>

      {/* Entry Body */}
      <div className="entry-body">
        
        {/* Category badge */}
        <div className="post-categories">
          <Link href={`/${categorySlug}`}>
            {post.category}
          </Link>
        </div>

        {/* Title */}
        <h2 className="entry-title">
          <Link href={`/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {/* Meta info */}
        <div className="entry-meta flex items-center gap-3">
          <span className="byline">by {post.author_name || 'Mangal'}</span>
          <span className="posted-on flex items-center gap-1">
            <Calendar style={{ width: '13px', height: '13px' }} />{' '}
            {post.created_at.split(' ')[0]}
          </span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="entry-excerpt">
            {post.excerpt}
          </p>
        )}

        {/* Read More Link */}
        <div style={{ marginTop: '12px' }}>
          <Link href={`/${post.slug}`} className="read-more-link">
            Read More &rarr;
          </Link>
        </div>

      </div>

    </article>
  );
}
