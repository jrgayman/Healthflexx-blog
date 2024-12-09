import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Category from '../pages/Category';
import Article from '../pages/Article';
import AdminLayout from '../layouts/AdminLayout';
import ContentManager from '../pages/admin/ContentManager';
import UserManager from '../pages/admin/UserManager';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/blog/:category',
    element: <Category />
  },
  {
    path: '/blog/:category/:slug',
    element: <Article />
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <ContentManager />
      },
      {
        path: 'content',
        element: <ContentManager />
      },
      {
        path: 'users',
        element: <UserManager />
      }
    ]
  }
]);

export default router;