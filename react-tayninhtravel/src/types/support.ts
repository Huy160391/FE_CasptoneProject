// Support ticket related types
export type TicketStatus = 'Open' | 'Resolved' | 'Rejected';

export interface UserSupportTicket {
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

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: 'booking' | 'payment' | 'technical' | 'general';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    userId: string;
    user?: import('./user').User;
    assignedTo?: string;
    assignedUser?: import('./user').User;
    responses?: TicketResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface TicketResponse {
    id: string;
    content: string;
    userId: string;
    user?: import('./user').User;
    isStaff: boolean;
    attachments?: string[];
    createdAt: string;
}

export interface AdminSupportTicket {
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
