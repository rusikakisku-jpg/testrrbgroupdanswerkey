import { MetadataRoute } from 'next';
import { getPosts, getCategories } from '@/lib/db';
import { categoryToSlug } from '@/lib/utils';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rrbgroupdanswerkey.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blogs`, lastModified: new Date() },
    { url: `${baseUrl}/answer-key-calculator`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
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
    url: `${baseUrl}/${categoryToSlug(cat)}`,
    lastModified: new Date(),
  }));

  const posts = await getPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date((post.created_at || '').replace(' ', 'T') || Date.now()),
  }));

  return [...staticPages, ...categoryUrls, ...postUrls];
}
