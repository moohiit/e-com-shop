// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App'
// import Products from '@/pages/Products';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import SellerDashboard from '../pages/Dashboard/SellerDashboard';
// import NotFound from '@/pages/NotFound';
import RequireAuth from './RequireAuth';
import RequireRole from './RequireRole';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Home from '../pages/Home'; 
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      // { path: '/products', element: <Products /> },
      {
        path: '/admin/dashboard',
        element: (
          <RequireAuth>
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          </RequireAuth>
        )
      },
      {
        path: '/seller/dashboard',
        element: (
          <RequireAuth>
            <RequireRole role="seller">
              <SellerDashboard />
            </RequireRole>
          </RequireAuth>
        )
      },
      // { path: '*', element: <NotFound /> }
    ]
  }
]);
