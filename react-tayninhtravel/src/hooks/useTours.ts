import { useState, useEffect } from 'react';
import { Tour, ApiResponse, PaginationParams } from '../types';

interface UseTourState {
    tours: Tour[];
    loading: boolean;
    error: string | null;
    totalRecords: number;
    currentPage: number;
}

export const useTours = (params?: PaginationParams) => {
    const [state, setState] = useState<UseTourState>({
        tours: [],
        loading: false,
        error: null,
        totalRecords: 0,
        currentPage: 1
    });

    const fetchTours = async (_newParams?: PaginationParams) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Note: Adjust this when actual tour API is available
            // For now, we'll use a placeholder structure
            const mockResponse: ApiResponse<Tour[]> = {
                success: true,
                data: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10,
                    hasNext: false,
                    hasPrev: false
                }
            };

            setState(prev => ({
                ...prev,
                tours: mockResponse.data,
                totalRecords: mockResponse.pagination?.totalItems || 0,
                currentPage: mockResponse.pagination?.currentPage || 1,
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
        fetchTours(params);
    }, []);

    const refetch = (newParams?: PaginationParams) => {
        fetchTours(newParams || params);
    };

    return {
        ...state,
        refetch
    };
};

export const useTour = (id: string) => {
    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchTour = async () => {
            try {
                setLoading(true);
                setError(null);

                // Placeholder for actual API call
                // const response = await tourService.getTourById(id);
                // setTour(response.data);

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        fetchTour();
    }, [id]);

    return { tour, loading, error, setTour };
};
