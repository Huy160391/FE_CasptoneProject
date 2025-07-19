import { RouteObject } from 'react-router-dom';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Support from '@/pages/Support';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import ThingsToDo from '@/pages/ThingsToDo';
import ThingsToDoDetail from '@/pages/ThingsToDoDetail';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Career from '@/pages/Career';
import CartDetail from '@/components/cart/CartDetail';
import Checkout from '@/components/payment/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import BookingPage from '@/pages/BookingPage';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import BookingHistory from '@/pages/BookingHistory';
import TourDetailsPage from '@/pages/TourDetailsPage';
import DebugAuth from '@/pages/DebugAuth';
import BookingHistoryTest from '@/components/debug/BookingHistoryTest';
import ImageUploadTest from '@/components/debug/ImageUploadTest';

export const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/about',
        element: <About />,
    },
    {
        path: '/support',
        element: <Support />,
    },
    {
        path: '/shop',
        element: <Shop />,
    },
    {
        path: '/shop/product/:id',
        element: <ProductDetail />,
    },
    {
        path: '/cart',
        element: <CartDetail />,
    },

    {
        path: '/order-success',
        element: <OrderSuccess />,
    },
    {
        path: '/things-to-do',
        element: <ThingsToDo />,
    },
    {
        path: '/things-to-do/detail/:id',
        element: <ThingsToDoDetail />,
    },
    {
        path: '/things-to-do/:id',
        element: <ThingsToDoDetail />,
    },
    {
        path: '/tour-details/:tourId',
        element: <TourDetailsPage />,
    },
    {
        path: '/blog',
        element: <Blog />,
    }, {
        path: '/blog/post/:id',
        element: <BlogPost />,
    }, {
        path: '/career',
        element: <Career />,
    },
    {
        path: '/booking/:tourId',
        element: <BookingPage />,
    },
    {
        path: '/booking-history',
        element: <BookingHistory />,
    },
    {
        path: '/404',
        element: <NotFound />,
    },
    {
        path: '/unauthorized',
        element: <Unauthorized />,
    },
    {
        path: '/debug-auth',
        element: <DebugAuth />,
    },
    {
        path: '/test-booking-history',
        element: <BookingHistoryTest />,
    },
    {
        path: '/test-image-upload',
        element: <ImageUploadTest />,
    },
    {
        path: '/payment-success',
        element: <PaymentSuccess />,
    },
    {
        path: '/payment-cancel',
        element: <PaymentCancel />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
    {
        path: '/checkout',
        element: <Checkout />,
    }
];