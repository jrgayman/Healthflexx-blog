import React from 'react';
import { Link } from 'react-router-dom';

export default function ContentAPIs() {
  const endpoints = [
    {
      category: 'Categories',
      description: 'Content category management',
      routes: [
        {
          method: 'GET',
          path: '/api/categories',
          description: 'Get all content categories',
          response: {
            data: 'Array of category objects with id, name, icon, and description'
          }
        },
        {
          method: 'GET',
          path: '/api/categories/:slug',
          description: 'Get category by slug',
          response: {
            category: 'Category object'
          }
        }
      ]
    },
    {
      category: 'Articles',
      description: 'Article content endpoints',
      routes: [
        {
          method: 'GET',
          path: '/api/articles',
          description: 'Get all articles',
          query: {
            category: 'string (category slug)',
            page: 'number',
            limit: 'number',
            featured: 'boolean'
          },
          response: {
            data: 'Array of article objects',
            meta: {
              total: 'number',
              page: 'number',
              last_page: 'number'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/articles/:slug',
          description: 'Get article by slug',
          response: {
            article: 'Article object with full content'
          }
        },
        {
          method: 'GET',
          path: '/api/articles/featured',
          description: 'Get featured articles',
          response: {
            data: 'Array of featured article objects'
          }
        }
      ]
    },
    {
      category: 'Videos',
      description: 'Video content endpoints',
      routes: [
        {
          method: 'GET',
          path: '/api/videos',
          description: 'Get all videos',
          query: {
            category: 'string (category slug)',
            page: 'number',
            limit: 'number'
          },
          response: {
            data: 'Array of video objects',
            meta: {
              total: 'number',
              page: 'number',
              last_page: 'number'
            }
          }
        },
        {
          method: 'GET',
          path: '/api/videos/:id',
          description: 'Get video by ID',
          response: {
            video: 'Video object with full details'
          }
        }
      ]
    },
    {
      category: 'Search',
      description: 'Content search functionality',
      routes: [
        {
          method: 'GET',
          path: '/api/search',
          description: 'Search all content types',
          query: {
            q: 'string (search term)',
            type: 'string (article|video|app|weblink)',
            category: 'string (category slug)',
            page: 'number',
            limit: 'number'
          },
          response: {
            data: 'Array of content objects',
            meta: {
              total: 'number',
              page: 'number',
              last_page: 'number'
            }
          }
        }
      ]
    },
    {
      category: 'Likes',
      description: 'Content engagement endpoints',
      routes: [
        {
          method: 'POST',
          path: '/api/content/:id/like',
          description: 'Like a content item',
          auth: true,
          response: {
            likes: 'number (updated like count)'
          }
        },
        {
          method: 'DELETE',
          path: '/api/content/:id/like',
          description: 'Remove like from content item',
          auth: true,
          response: {
            likes: 'number (updated like count)'
          }
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Content APIs</h1>
        <p className="mt-2 text-gray-600">API documentation for mobile applications and third-party integrations.</p>
      </div>

      <div className="space-y-12">
        {endpoints.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
            </div>
            <div className="divide-y divide-gray-200">
              {category.routes.map((route, index) => (
                <div key={index} className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-sm font-medium rounded ${
                      route.method === 'GET' ? 'bg-green-100 text-green-800' :
                      route.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      route.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {route.method}
                    </span>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {route.path}
                    </code>
                    {route.auth && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Requires Auth
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{route.description}</p>

                  {route.query && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Query Parameters:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-sm">
                        {JSON.stringify(route.query, null, 2)}
                      </pre>
                    </div>
                  )}

                  {route.response && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Response:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-sm">
                        {JSON.stringify(route.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">
          For endpoints that require authentication, include the JWT token in the Authorization header:
        </p>
        <pre className="bg-gray-50 p-3 rounded text-sm">
          Authorization: Bearer your-jwt-token
        </pre>
      </div>
    </div>
  );
}