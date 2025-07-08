import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useAuthStore } from '../store/useAuthStore';
import {
    getTourTemplates,
    createTourTemplate,
    updateTourTemplate,
    deleteTourTemplate,
    getTourTemplateDetail,
    createTourDetails,
    getTourDetailsList,
    getTourDetailsById,
    updateTourDetails,
    deleteTourDetails,
    createTimelineItems,
    handleApiError,
    performanceTracker
} from '../services/tourcompanyService';
import {
    TourTemplate,
    TourDetails,
    CreateTourTemplateRequest,
    UpdateTourTemplateRequest,
    CreateTourDetailsRequest,
    GetTourTemplatesParams,
    CreateTimelineItemsRequest
} from '../types/tour';

interface UseTourTemplateReturn {
    // Templates
    templates: TourTemplate[];
    templatesLoading: boolean;
    loadTemplates: (params?: GetTourTemplatesParams) => Promise<void>;
    createTemplate: (data: CreateTourTemplateRequest) => Promise<boolean>;
    updateTemplate: (id: string, data: UpdateTourTemplateRequest) => Promise<boolean>;
    deleteTemplate: (id: string) => Promise<boolean>;
    getTemplateDetail: (id: string) => Promise<TourTemplate | null>;

    // Tour Details
    tourDetails: TourDetails[];
    detailsLoading: boolean;
    loadTourDetails: (params?: any) => Promise<void>;
    createDetails: (data: CreateTourDetailsRequest) => Promise<boolean>;
    updateDetails: (id: string, data: Partial<CreateTourDetailsRequest>) => Promise<boolean>;
    deleteDetails: (id: string) => Promise<boolean>;
    getDetailsById: (id: string) => Promise<TourDetails | null>;

    // Timeline
    createTimeline: (data: CreateTimelineItemsRequest) => Promise<boolean>;

    // Utility
    refreshData: () => Promise<void>;
}

export const useTourTemplate = (): UseTourTemplateReturn => {
    const { token } = useAuthStore();
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [tourDetails, setTourDetails] = useState<TourDetails[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Load templates
    const loadTemplates = useCallback(async (params?: GetTourTemplatesParams) => {
        try {
            setTemplatesLoading(true);
            performanceTracker.start('Load Templates');
            
            const response = await getTourTemplates(params, token ?? undefined);
            if (response.statusCode === 200 && response.data) {
                setTemplates(response.data || []);
            }
            
            performanceTracker.end('Load Templates');
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setTemplatesLoading(false);
        }
    }, [token]);

    // Create template
    const createTemplate = useCallback(async (data: CreateTourTemplateRequest): Promise<boolean> => {
        try {
            performanceTracker.start('Create Template');
            
            const response = await createTourTemplate(data, token ?? undefined);
            if (response.success) {
                message.success(response.message || 'Tạo template thành công');
                await loadTemplates(); // Refresh list
                performanceTracker.end('Create Template');
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTemplates]);

    // Update template
    const updateTemplate = useCallback(async (id: string, data: UpdateTourTemplateRequest): Promise<boolean> => {
        try {
            performanceTracker.start('Update Template');
            
            const response = await updateTourTemplate(id, data, token ?? undefined);
            if (response.success) {
                message.success('Cập nhật template thành công');
                await loadTemplates(); // Refresh list
                performanceTracker.end('Update Template');
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTemplates]);

    // Delete template
    const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
        try {
            const response = await deleteTourTemplate(id, token ?? undefined);
            if (response.success) {
                message.success('Xóa template thành công');
                await loadTemplates(); // Refresh list
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTemplates]);

    // Get template detail
    const getTemplateDetail = useCallback(async (id: string): Promise<TourTemplate | null> => {
        try {
            return await getTourTemplateDetail(id, token ?? '');
        } catch (error) {
            message.error(handleApiError(error));
            return null;
        }
    }, [token]);

    // Load tour details
    const loadTourDetails = useCallback(async (params?: any) => {
        try {
            setDetailsLoading(true);
            performanceTracker.start('Load Tour Details');
            
            const response = await getTourDetailsList(params, token ?? undefined);
            if (response.success && response.data) {
                setTourDetails(response.data || []);
            }
            
            performanceTracker.end('Load Tour Details');
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setDetailsLoading(false);
        }
    }, [token]);

    // Create tour details
    const createDetails = useCallback(async (data: CreateTourDetailsRequest): Promise<boolean> => {
        try {
            performanceTracker.start('Create Tour Details');
            
            const response = await createTourDetails(data, token ?? undefined);
            if (response.success) {
                message.success(response.message || 'Tạo tour details thành công');
                await loadTourDetails(); // Refresh list
                performanceTracker.end('Create Tour Details');
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTourDetails]);

    // Update tour details
    const updateDetails = useCallback(async (id: string, data: Partial<CreateTourDetailsRequest>): Promise<boolean> => {
        try {
            performanceTracker.start('Update Tour Details');
            
            const response = await updateTourDetails(id, data, token ?? undefined);
            if (response.success) {
                message.success('Cập nhật tour details thành công');
                await loadTourDetails(); // Refresh list
                performanceTracker.end('Update Tour Details');
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTourDetails]);

    // Delete tour details
    const deleteDetails = useCallback(async (id: string): Promise<boolean> => {
        try {
            const response = await deleteTourDetails(id, token ?? undefined);
            if (response.success) {
                message.success('Xóa tour details thành công');
                await loadTourDetails(); // Refresh list
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token, loadTourDetails]);

    // Get tour details by ID
    const getDetailsById = useCallback(async (id: string): Promise<TourDetails | null> => {
        try {
            const response = await getTourDetailsById(id, token ?? undefined);
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            message.error(handleApiError(error));
            return null;
        }
    }, [token]);

    // Create timeline
    const createTimeline = useCallback(async (data: CreateTimelineItemsRequest): Promise<boolean> => {
        try {
            performanceTracker.start('Create Timeline');
            
            const response = await createTimelineItems(data, token ?? undefined);
            if (response.success) {
                message.success(`Tạo ${response.data?.createdCount || data.timelineItems.length} timeline items thành công`);
                performanceTracker.end('Create Timeline');
                return true;
            }
            return false;
        } catch (error) {
            message.error(handleApiError(error));
            return false;
        }
    }, [token]);

    // Refresh all data
    const refreshData = useCallback(async () => {
        await Promise.all([
            loadTemplates(),
            loadTourDetails()
        ]);
    }, [loadTemplates, loadTourDetails]);

    // Load initial data
    useEffect(() => {
        if (token) {
            refreshData();
        }
    }, [token, refreshData]);

    return {
        // Templates
        templates,
        templatesLoading,
        loadTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplateDetail,

        // Tour Details
        tourDetails,
        detailsLoading,
        loadTourDetails,
        createDetails,
        updateDetails,
        deleteDetails,
        getDetailsById,

        // Timeline
        createTimeline,

        // Utility
        refreshData
    };
};
