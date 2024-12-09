import { supabase } from './supabase';

export const getImageUrl = (path) => {
  if (!path) return null;

  if (path.startsWith('http')) {
    return path;
  }

  const { data } = supabase.storage
    .from('content-images')
    .getPublicUrl(path);

  return data?.publicUrl || null;
};

export const handleImageError = (e, size = 'medium') => {
  e.target.onerror = null;
  
  const sizes = {
    small: '100x100',
    medium: '600x400',
    large: '1200x400'
  };

  e.target.src = `https://placehold.co/${sizes[size]}?text=Image+Not+Available`;
  e.target.className = `w-full h-${size === 'small' ? '10' : '48'} object-cover opacity-75`;
};

export async function uploadContentImage(file) {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `content/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteContentImage(path) {
  if (!path) return;

  try {
    const { error } = await supabase.storage
      .from('content-images')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}