import { TourDetailsStatus } from '../types/tour';

/**
 * Helper function to map API string status to enum
 * Centralized status mapping logic to ensure consistency across the app
 */
export const mapStringToStatusEnum = (status: string | TourDetailsStatus): TourDetailsStatus => {
    if (typeof status === 'number') {
        return status;
    }
    
    switch (status) {
        case 'Pending':
            return TourDetailsStatus.Pending;
        case 'Approved':
            return TourDetailsStatus.Approved;
        case 'Rejected':
            return TourDetailsStatus.Rejected;
        case 'Suspended':
            return TourDetailsStatus.Suspended;
        case 'AwaitingGuideAssignment':
            return TourDetailsStatus.AwaitingGuideAssignment;
        case 'Cancelled':
            return TourDetailsStatus.Cancelled;
        case 'AwaitingAdminApproval':
            return TourDetailsStatus.AwaitingAdminApproval;
        case 'WaitToPublic':
            return TourDetailsStatus.WaitToPublic;
        case 'Public':
            return TourDetailsStatus.Public;
        default:
            console.warn('Unknown status in statusMapper:', status);
            return TourDetailsStatus.Pending;
    }
};

/**
 * Helper function to safely compare status regardless of string/number type
 */
export const compareStatus = (status: string | TourDetailsStatus, targetStatus: TourDetailsStatus): boolean => {
    return mapStringToStatusEnum(status) === targetStatus;
};

/**
 * Helper function to filter tours by status
 */
export const filterToursByStatus = <T extends { status: string | TourDetailsStatus }>(
    tours: T[], 
    targetStatus: TourDetailsStatus
): T[] => {
    return tours.filter(tour => compareStatus(tour.status, targetStatus));
};