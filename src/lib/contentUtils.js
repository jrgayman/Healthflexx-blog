import { supabase } from './supabase';
import slugify from 'slugify';

export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function fetchFeaturedContent() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          description,
          slug
        )
      `)
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured content:', error);
    throw error;
  }
}

export async function fetchContentByCategory(categoryId, page = 1, limit = 10) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        content_categories (
          id,
          name,
          icon,
          description,
          slug
        )
      `, { count: 'exact' })
      .eq('content_category_link', categoryId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: data || [],
      meta: {
        total: count,
        page,
        last_page: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}