import { supabase } from './supabase';

export async function fetchContentUsers() {
  try {
    const { data, error } = await supabase
      .from('content_user_details')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function createContentUser(userData) {
  try {
    const { data, error } = await supabase
      .from('content_users')
      .insert([{
        ...userData,
        password_hash: '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', // Default password
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateContentUser(userId, userData) {
  try {
    const { data, error } = await supabase
      .from('content_users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteContentUser(userId) {
  try {
    const { error } = await supabase
      .from('content_users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}