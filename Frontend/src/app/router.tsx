// Основной роутинг приложения.
// Здесь описаны все страницы и маршруты frontend-части.

import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { HomePage } from '../pages/HomePage/HomePage'
import { LoginPage } from '../pages/LoginPage/LoginPage'
import { RegisterPage } from '../pages/RegisterPage/RegisterPage'
import { CreatePropertyPage } from '../pages/CreatePropertyPage/CreatePropertyPage'
import { ProfilePage } from '../pages/ProfilePage/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'create-property',
        element: <CreatePropertyPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
])