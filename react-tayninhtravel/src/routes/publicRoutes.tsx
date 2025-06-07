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
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

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
        path: '/things-to-do',
        element: <ThingsToDo />,
    },
    {
        path: '/things-to-do/detail/:id',
        element: <ThingsToDoDetail />,
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
    }, {
        path: '/404',
        element: <NotFound />,
    },
    {
        path: '/unauthorized',
        element: <Unauthorized />,
    },
    {
        path: '*',
        element: <NotFound />,
    }
];