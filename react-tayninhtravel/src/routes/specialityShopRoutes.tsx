import ProtectedRoute from './ProtectedRoute';
import SpecialityShopLayout from '../components/layout/SpecialityShopLayout';
import Dashboard from '../pages/specialityshop/Dashboard';
import Products from '../pages/specialityshop/Products';
import Orders from '../pages/specialityshop/Orders';
import Reviews from '../pages/specialityshop/Reviews';

export const specialityShopRoutes = [
    {
        path: '/speciality-shop',
        element: <ProtectedRoute requiredRole="Specialty Shop" />,
        children: [
            {
                path: '',
                element: <SpecialityShopLayout />,
                children: [
                    { path: '', element: <Dashboard /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'products', element: <Products /> },
                    { path: 'orders', element: <Orders /> },
                    { path: 'reviews', element: <Reviews /> },
                ],
            },
        ],
    },
];