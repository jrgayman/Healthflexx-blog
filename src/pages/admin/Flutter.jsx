import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-dart';

export default function Flutter() {
  const [selectedTable, setSelectedTable] = useState('posts');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    Prism.highlightAll();
  }, [selectedTable]);

  const sqlQueries = {
    posts: `
-- Posts table structure
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  content_category_link UUID REFERENCES content_categories(id),
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'app', 'weblink')),
  storage_path TEXT,
  video_url TEXT,
  app_store_url TEXT,
  play_store_url TEXT,
  web_url TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(content_category_link);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(active);`,
    categories: `
-- Categories table structure
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON content_categories(slug);`,
    likes: `
-- Likes table structure
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET likes = (
      SELECT COUNT(*) 
      FROM post_likes 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET likes = (
      SELECT COUNT(*) 
      FROM post_likes 
      WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes count
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();`
  };

  const dartModels = {
    post: `
class Post {
  final String id;
  final String title;
  final String slug;
  final String? content;
  final String? excerpt;
  final String? categoryId;
  final String type;
  final String? storagePath;
  final String? videoUrl;
  final String? appStoreUrl;
  final String? playStoreUrl;
  final String? webUrl;
  final bool featured;
  final bool active;
  final int likes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Category? category;

  Post({
    required this.id,
    required this.title,
    required this.slug,
    this.content,
    this.excerpt,
    this.categoryId,
    required this.type,
    this.storagePath,
    this.videoUrl,
    this.appStoreUrl,
    this.playStoreUrl,
    this.webUrl,
    required this.featured,
    required this.active,
    required this.likes,
    required this.createdAt,
    required this.updatedAt,
    this.category,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      content: json['content'],
      excerpt: json['excerpt'],
      categoryId: json['content_category_link'],
      type: json['type'],
      storagePath: json['storage_path'],
      videoUrl: json['video_url'],
      appStoreUrl: json['app_store_url'],
      playStoreUrl: json['play_store_url'],
      webUrl: json['web_url'],
      featured: json['featured'] ?? false,
      active: json['active'] ?? true,
      likes: json['likes'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      category: json['content_categories'] != null 
        ? Category.fromJson(json['content_categories']) 
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'content': content,
      'excerpt': excerpt,
      'content_category_link': categoryId,
      'type': type,
      'storage_path': storagePath,
      'video_url': videoUrl,
      'app_store_url': appStoreUrl,
      'play_store_url': playStoreUrl,
      'web_url': webUrl,
      'featured': featured,
      'active': active,
      'likes': likes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}`,
    category: `
class Category {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? icon;
  final DateTime createdAt;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.icon,
    required this.createdAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      icon: json['icon'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'created_at': createdAt.toIso8601String(),
    };
  }
}`
  };

  const apiEndpoints = {
    posts: `
// Posts Repository
class PostsRepository {
  final SupabaseClient _supabase;

  PostsRepository(this._supabase);

  Future<List<Post>> getFeaturedPosts() async {
    final response = await _supabase
      .from('posts')
      .select('''
        *,
        content_categories (
          id,
          name,
          icon,
          description,
          slug
        )
      ''')
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', ascending: false);

    return (response as List)
      .map((post) => Post.fromJson(post))
      .toList();
  }

  Future<List<Post>> getPostsByCategory(String categoryId) async {
    final response = await _supabase
      .from('posts')
      .select('''
        *,
        content_categories (
          id,
          name,
          icon,
          description,
          slug
        )
      ''')
      .eq('content_category_link', categoryId)
      .eq('active', true)
      .order('created_at', ascending: false);

    return (response as List)
      .map((post) => Post.fromJson(post))
      .toList();
  }

  Future<Post> getPostBySlug(String categorySlug, String postSlug) async {
    final response = await _supabase
      .from('posts')
      .select('''
        *,
        content_categories (
          id,
          name,
          icon,
          description,
          slug
        )
      ''')
      .eq('slug', postSlug)
      .single();

    return Post.fromJson(response);
  }

  Future<void> likePost(String postId) async {
    await _supabase
      .from('post_likes')
      .insert({'post_id': postId});
  }

  Future<String?> getImageUrl(String storagePath) async {
    final response = await _supabase
      .storage
      .from('content-images')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    return response.signedUrl;
  }
}`,
    categories: `
// Categories Repository
class CategoriesRepository {
  final SupabaseClient _supabase;

  CategoriesRepository(this._supabase);

  Future<List<Category>> getCategories() async {
    final response = await _supabase
      .from('content_categories')
      .select()
      .order('name');

    return (response as List)
      .map((category) => Category.fromJson(category))
      .toList();
  }

  Future<Category> getCategoryBySlug(String slug) async {
    final response = await _supabase
      .from('content_categories')
      .select()
      .eq('slug', slug)
      .single();

    return Category.fromJson(response);
  }
}`
  };

  const handleCopyCode = (code, section) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(section);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const CodeBlock = ({ code, language, section }) => (
    <div className="relative">
      <button
        onClick={() => handleCopyCode(code, section)}
        className="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        {copySuccess === section ? 'Copied!' : 'Copy'}
      </button>
      <pre className={`language-${language}`}>
        <code className={`language-${language}`}>
          {code.trim()}
        </code>
      </pre>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Flutter Integration</h1>
        <p className="mt-2 text-gray-600">
          Integration code and documentation for Flutter mobile applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium text-gray-900 mb-4">Navigation</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedTable('posts')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedTable === 'posts' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setSelectedTable('categories')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedTable === 'categories' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setSelectedTable('likes')}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedTable === 'likes' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Likes
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* SQL Schema */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SQL Schema</h2>
            <CodeBlock 
              code={sqlQueries[selectedTable]} 
              language="sql"
              section={`sql-${selectedTable}`}
            />
          </div>

          {/* Dart Models */}
          {(selectedTable === 'posts' || selectedTable === 'categories') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dart Model</h2>
              <CodeBlock 
                code={dartModels[selectedTable === 'posts' ? 'post' : 'category']} 
                language="dart"
                section={`dart-${selectedTable}`}
              />
            </div>
          )}

          {/* API Endpoints */}
          {(selectedTable === 'posts' || selectedTable === 'categories') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API Repository</h2>
              <CodeBlock 
                code={apiEndpoints[selectedTable]} 
                language="dart"
                section={`api-${selectedTable}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}