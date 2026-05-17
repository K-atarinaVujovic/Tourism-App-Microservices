import { createBrowserRouter, Navigate } from 'react-router';
import HomePage from '../pages/HomePage.tsx';
import RootLayout from '../components/layout/RootLayout';
import RegistrationPage from '../pages/RegistrationPage';
import LoginPage from '../pages/LoginPage';

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
        element: <RegistrationPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'home',
        element: <HomePage />,
      },
    ],
  },
]);
