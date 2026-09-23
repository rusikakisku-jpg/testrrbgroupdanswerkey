import { MetadataRoute } from 'next';
import { getPosts, getCategories } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blogs/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const defaultCategories = ['Notification', 'Answer Key', 'Admit Card', 'Result', 'Syllabus'];
  let allCats = defaultCategories;
  try {
    const fetchedCats = await getCategories();
    if (fetchedCats.length > 0) {
      allCats = Array.from(new Set([...defaultCategories, ...fetchedCats.map((c) => c.category)]));
    }
  } catch {
    // fallback to default
  }

  const categoryUrls: MetadataRoute.Sitemap = allCats.map((cat) => ({
    url: `${baseUrl}/${categoryToSlug(cat)}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const posts = await getPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}/`,
    lastModified: new Date((post.created_at || '').replace(' ', 'T') || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryUrls, ...postUrls];
}
