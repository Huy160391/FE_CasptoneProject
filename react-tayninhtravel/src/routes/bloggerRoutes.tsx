import { RouteObject } from 'react-router-dom';
import BloggerDashboard from '@/pages/blogger/BloggerDashboard';
import MyBlogs from '@/pages/blogger/MyBlogs';
import BloggerMyInfo from '@/pages/blogger/BloggerMyInfo';
import CreateBlog from '@/pages/blogger/CreateBlog';
import EditBlog from '@/pages/blogger/EditBlog';

export const bloggerRoutes: RouteObject[] = [
    {
        path: '/blogger',
        children: [
            {
                path: 'dashboard',
                element: <BloggerDashboard />,
            },
            {
                path: 'my-blogs',
                element: <MyBlogs />,
            },
            {
                path: 'my-info',
                element: <BloggerMyInfo />,
            },
            {
                path: 'create-blog',
                element: <CreateBlog />,
            },
            {
                path: 'edit-blog/:id',
                element: <EditBlog />,
            },
        ],
    },
];
