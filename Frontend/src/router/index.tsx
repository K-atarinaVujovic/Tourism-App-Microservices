import { createBrowserRouter, Navigate } from 'react-router';
import HomePage from '../pages/HomePage.tsx';
import MapPage from '../pages/MapPage.tsx';
import TourCreatePage from '../pages/TourCreatePage.tsx';
import TourKeypointsPage from '../pages/TourKeypointsPage.tsx';
import RootLayout from '../components/layout/RootLayout';
import RegistrationPage from '../pages/RegistrationPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage.tsx';
import AdminPage from '@/pages/AdminPage.tsx';
import ToursPage from "@/pages/ToursPage.tsx";
import TourDetailPage from "@/pages/ToursDetailPage.tsx";
import BlogListPage from '@/pages/BlogListPage.tsx';
import CreateBlogPage from '@/pages/CreateBlogPage.tsx';
import BlogPage from '@/pages/BlogPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'register',
        element: <RegistrationPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'tours/create',
        element: <TourCreatePage />,
      },
      {
        path: 'tours/:id/keypoints',
        element: <TourKeypointsPage />,
      },
      {
        path: 'profile/:userId', // modify this however needed
        element: <ProfilePage />,
      },
      {
        path: 'admin/users',
        element: <AdminPage />,
      },
      {
        path: 'tours/',
        element: <ToursPage />,
      },
      {
        path: 'tours/:id',
        element: <TourDetailPage />,
      },
      { path: "blogs", 
        element: <BlogListPage /> 
      },
      { path: "blogs/create", 
        element: <CreateBlogPage /> 
      },
      { path: "blogs/:blogId", 
        element: <BlogPage /> 
      },
    ],
  },
]);
