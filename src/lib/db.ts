import { Post, Comment, Setting } from './types';
import { categoryToSlug } from './utils';

// Target Cloudflare Worker API Base Endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';

export { categoryToSlug };

export async function getPosts(options?: { category?: string; status?: string; limit?: number; search?: string; order?: 'asc' | 'desc' }): Promise<Post[]> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('q', options.search);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.order) params.append('order', options.order);

    const res = await fetch(`${API_BASE}/api/posts?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (err) {
    console.error('API Error in getPosts:', err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!slug) return null;
  try {
    const cleanSlug = encodeURIComponent(slug.trim().toLowerCase());
    const res = await fetch(`${API_BASE}/api/posts/${cleanSlug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error('API Error in getPostBySlug:', err);
    return null;
  }
}

export async function incrementViews(postId: number): Promise<void> {
  // Handled automatically by Cloudflare Worker API on GET /api/posts/:slug
}

export async function getComments(postId: number): Promise<Comment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/comments?post_id=${postId}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (err) {
    console.error('API Error in getComments:', err);
    return [];
  }
}

export async function addComment(data: { post_id: number; author_name: string; author_email: string; content: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('API Error in addComment:', err);
    return false;
  }
}

export async function addSubscriber(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch (err) {
    console.error('API Error in addSubscriber:', err);
    return false;
  }
}

export async function getCategories(): Promise<{ category: string; count: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('API Error in getCategories:', err);
  }

  try {
    const posts = await getPosts();
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  } catch {
    return [];
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      return await res.json();
    }
    return {};
  } catch (err) {
    console.error('API Error in getSettings:', err);
    return {};
  }
}

export async function updateSettings(data: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('API Error in updateSettings:', err);
    return false;
  }
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  return getPosts({ status: 'all' });
}

export async function savePost(data: Partial<Post>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('API Error in savePost:', err);
    return false;
  }
}

export async function deletePost(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    return res.ok;
  } catch (err) {
    console.error('API Error in deletePost:', err);
    return false;
  }
}
