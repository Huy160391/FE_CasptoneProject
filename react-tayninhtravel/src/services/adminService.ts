import axios from '@/config/axios';
// Import type definitions
import { TicketStatus } from './userService';

// Interfaces
export interface GetUsersParams {
    page: number;
    pageSize: number;
    search?: string;
    status?: boolean;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiUser {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    avatar: string;
    isVerified: boolean;
    isActive: boolean;
    role?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SupportTicket {
    id: string;
    title: string;
    content: string;
    status: TicketStatus;
    createdAt: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    images: {
        id: string;
        url: string;
    }[];
    response?: string;
}

class AdminService {
    // Support Tickets Management
    async getSupportTickets(status?: TicketStatus): Promise<SupportTicket[]> {
        try {
            let url = 'SupportTickets/Admin';
            if (status) {
                url += `?status=${encodeURIComponent(status)}`;
            }

            const response = await axios.get<SupportTicket[]>(url);

            // Validate and transform response
            const tickets = Array.isArray(response.data) ? response.data : [];
            return tickets.map(ticket => this.validateTicket(ticket));

        } catch (error) {
            this.handleError(error, 'Error fetching admin support tickets');
            return [];
        }
    } async updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<void> {
        try {
            if (!ticketId) {
                throw new Error('Ticket ID is required');
            }

            // Convert status string to number for API
            let statusNumber: number;
            switch (newStatus) {
                case 'Open':
                    statusNumber = 0;
                    break;
                case 'Resolved':
                    statusNumber = 1;
                    break;
                case 'Rejected':
                    statusNumber = 2;
                    break;
                default:
                    throw new Error('Invalid status');
            }

            await axios.put(`SupportTickets/Admin/${ticketId}/status`, { status: statusNumber });
        } catch (error) {
            this.handleError(error, 'Error updating ticket status');
        }
    }

    async respondToTicket(ticketId: string, response: string): Promise<void> {
        try {
            if (!ticketId) {
                throw new Error('Ticket ID is required');
            }
            if (!response.trim()) {
                throw new Error('Response cannot be empty');
            }

            await axios.put(`SupportTickets/Admin/${ticketId}/respond`, { response: response.trim() });
        } catch (error) {
            this.handleError(error, 'Error sending ticket response');
        }
    } private validateTicket(ticket: any): SupportTicket {
        if (!ticket || typeof ticket !== 'object') {
            throw new Error('Invalid ticket data received from server');
        }

        // Required fields validation
        if (!ticket.id || !ticket.title || !ticket.content || ticket.status === undefined) {
            throw new Error('Missing required ticket fields');
        }

        // Status validation
        const status = Number(ticket.status);
        let ticketStatus: TicketStatus;

        switch (status) {
            case 0:
                ticketStatus = 'Open';
                break;
            case 1:
                ticketStatus = 'Resolved';
                break;
            case 2:
                ticketStatus = 'Rejected';
                break;
            default:
                throw new Error('Invalid ticket status');
        }

        return {
            id: ticket.id,
            title: ticket.title,
            content: ticket.content,
            status: ticketStatus,
            createdAt: ticket.createdAt || new Date().toISOString(),
            userId: ticket.userId || '',
            userName: ticket.userName || '',
            userEmail: ticket.userEmail || '',
            images: Array.isArray(ticket.images) ? ticket.images : [],
            response: ticket.response
        };
    }

    private handleError(error: unknown, context: string): never {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; data: any } };

            if (process.env.NODE_ENV === 'development') {
                console.error(`${context}:`, {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data
                });
            }

            // Handle specific error codes
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                throw new Error('Unauthorized access');
            }
        }

        throw error instanceof Error ? error : new Error(context);
    }
}

export const adminService = new AdminService();
export default adminService;
