import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SpecialityShopLayout from '../components/layout/SpecialityShopLayout';
import Products from '../pages/specialityshop/Products';
import Orders from '../pages/specialityshop/Orders';
import Reviews from '../pages/specialityshop/Reviews';

export const specialityShopRoutes = [
    {
        path: '/speciality-shop',
        element: <ProtectedRoute requiredRole="Speciality shop" />,
        children: [
            {
                path: '',
                element: <SpecialityShopLayout />,
                children: [
                    { path: '', element: <Navigate to="/speciality-shop/products" /> },
                    { path: 'products', element: <Products /> },
                    { path: 'orders', element: <Orders /> },
                    { path: 'reviews', element: <Reviews /> },
                ],
            },
        ],
    },
];