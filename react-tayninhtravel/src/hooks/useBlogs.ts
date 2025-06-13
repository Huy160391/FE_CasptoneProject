import { useState, useEffect } from 'react';
import { publicService, Blog, GetBlogsResponse } from '../services/publicService';

interface UseBlogsState {
    blogs: Blog[];
    loading: boolean;
    error: string | null;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
}

export const useBlogs = (
    page: number = 1,
    pageSize: number = 10,
    searchText?: string
) => {
    const [state, setState] = useState<UseBlogsState>({
        blogs: [],
        loading: false,
        error: null,
        totalRecords: 0,
        currentPage: page,
        pageSize
    });

    const fetchBlogs = async (
        newPage?: number,
        newPageSize?: number,
        newSearchText?: string
    ) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response: GetBlogsResponse = await publicService.getPublicBlogs(
                newPage || page,
                newPageSize || pageSize,
                newSearchText || searchText
            );

            setState(prev => ({
                ...prev,
                blogs: response.data,
                totalRecords: response.totalRecords,
                currentPage: response.currentPage,
                pageSize: response.pageSize,
                loading: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error',
                loading: false
            }));
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page, pageSize, searchText]);

    const refetch = (
        newPage?: number,
        newPageSize?: number,
        newSearchText?: string
    ) => {
        fetchBlogs(newPage, newPageSize, newSearchText);
    };

    return {
        ...state,
        refetch
    };
};

export const useBlog = (id: string) => {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await publicService.getBlogById(id);
                setBlog(response);

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    return { blog, loading, error };
};
