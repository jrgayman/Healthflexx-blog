import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navigation from './components/layout/Navigation';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import AdminLayout from './layouts/AdminLayout';
import AuthCallback from './pages/auth/callback';

// Lazy load admin pages
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const ContentAPIs = lazy(() => import('./pages/admin/apis/ContentAPIs'));
const Flutter = lazy(() => import('./pages/admin/Flutter'));

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:category" element={<Category />} />
        <Route path="/blog/:category/:slug" element={<Article />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="content" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ContentManager />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserManager />
            </Suspense>
          } />
          <Route path="apis" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ContentAPIs />
            </Suspense>
          } />
          <Route path="flutter" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Flutter />
            </Suspense>
          } />
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <ContentManager />
            </Suspense>
          } />
        </Route>
      </Routes>
    </div>
  );
}