import { RouteObject } from 'react-router-dom';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Support from '@/pages/Support';
import Shop from '@/pages/Shop';
import ShopList from '@/pages/ShopList';
import ProductDetail from '@/pages/ProductDetail';
import ShopDetail from '@/pages/ShopDetail';
import ThingsToDo from '@/pages/ThingsToDo';
// import ThingsToDoDetail from '@/pages/ThingsToDoDetail';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Career from '@/pages/Career';
import CartDetail from '@/components/cart/CartDetail';
import Checkout from '@/components/payment/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import BookingPage from '@/pages/BookingPage';
import TourPaymentSuccess from '@/./components/payment/TourPaymentSuccess';
import TourPaymentCancel from '@/./components/payment/TourPaymentCancel';
import ProductPaymentSuccess from '@/./components/payment/ProductPaymentSuccess';
import ProductPaymentCancel from '@/./components/payment/ProductPaymentCancel';
// import TourPaymentSuccess from '@/pages/TourPaymentSuccess';
// import TourPaymentCancel from '@/pages/TourPaymentCancel';
// import ProductPaymentSuccess from '@/pages/ProductPaymentSuccess';
// import ProductPaymentCancel from '@/pages/ProductPaymentCancel';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import BookingHistory from '@/pages/BookingHistory';
import TourDetailsPage from '@/pages/TourDetailsPage';
import DebugAuth from '@/pages/DebugAuth';
import BookingHistoryTest from '@/components/debug/BookingHistoryTest';
import ImageUploadTest from '@/components/debug/ImageUploadTest';
import TourCompanyDetail from '@/pages/tourcompany/TourCompanyDetail';

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
        path: '/shops',
        element: <ShopList />,
    },
    {
        path: '/shop/product/:id',
        element: <ProductDetail />,
    },
    {
        path: '/shop/:shopId',
        element: <ShopDetail />,
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
        path: '/tours',
        element: <ThingsToDo />,
    },
    {
        path: '/tour-details/:tourId',
        element: <TourDetailsPage />,
    },
    {
        path: '/tour-company/:companyId',
        element: <TourCompanyDetail />,
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
    // Unified Payment Routes (Enhanced Payment System)
    {
        path: '/payment-success',
        element: <PaymentSuccess />,
    },
    {
        path: '/payment-cancel',
        element: <PaymentCancel />,
    },
    // Legacy Product Payment Routes (for backward compatibility)
    {
        path: '/product-payment-success',
        element: <ProductPaymentSuccess />,
    },
    {
        path: '/product-payment-cancel',
        element: <ProductPaymentCancel />,
    },
    // Legacy Tour Payment Routes (for backward compatibility)
    {
        path: '/tour-payment-success',
        element: <TourPaymentSuccess />,
    },
    {
        path: '/tour-payment-cancel',
        element: <TourPaymentCancel />,
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
        path: '*',
        element: <NotFound />,
    },
    {
        path: '/checkout',
        element: <Checkout />,
    }
];