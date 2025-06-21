// Comment and review related types
export interface Comment {
    id: string;
    content: string;
    authorId: string;
    author?: import('./user').User;
    entityType: 'tour' | 'blog' | 'product';
    entityId: string;
    parentId?: string;
    replies?: Comment[];
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserComment {
    id: string;
    content: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    blogId: string;
    parentCommentId?: string | null;
    createdAt: string;
    updatedAt?: string;
    likes?: number;
    replies?: UserComment[];
    statusCode?: number;
    message?: string | null;
    isSuccess?: boolean;
    validationErrors?: any[];
}

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    userId: string;
    user?: import('./user').User;
    entityType: 'tour' | 'product';
    entityId: string;
    isVerified: boolean;
    isApproved: boolean;
    helpful: number;
    createdAt: string;
    updatedAt: string;
}
