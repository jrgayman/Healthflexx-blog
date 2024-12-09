import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx
            </Link>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              <Link
                to="/admin/content"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/content'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Content Manager
              </Link>
              <Link
                to="/admin/users"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/users'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                User Manager
              </Link>
              <Link
                to="/admin/apis"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/apis'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                APIs
              </Link>
              <Link
                to="/admin/flutter"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/flutter'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Flutter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}