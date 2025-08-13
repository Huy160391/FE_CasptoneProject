// Blog-related types
export interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    authorId: string;
    author?: import('./user').User;
    category: string;
    tags: string[];
    images: string[];
    thumbnail?: string;
    status: 'draft' | 'published' | 'archived';
    viewCount: number;
    isFeature: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content?: string;
    category?: string;
    tags?: string[];
    featuredImage?: string;
    status: 0 | 1 | 2; // 0=pending, 1=accepted, 2=rejected
    likes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    authorId?: string;
    authorName?: string;
}

export interface UserBlog {
    id: string;
    title: string;
    content: string;
    imageUrl?: string[];
    authorName: string;
    status?: number; // 0=pending, 1=published, 2=rejected
    totalLikes?: number;
    totalDislikes?: number;
    totalComments?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiBlogPost {
    id: string;
    title: string;
    content: string;
    authorName: string;
    commentOfAdmin?: string;
    status: 0 | 1 | 2; // 0=pending, 1=accepted, 2=rejected
    imageUrl?: string[];
    totalLikes: number;
    totalDislikes: number;
    totalComments: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiGetBlogsResponse {
    statusCode: number;
    message: string | null;
    data: ApiBlogPost[];
    totalPages: number;
    totalRecord: number;
    totalCount: number | null;
    pageIndex: number | null;
    pageSize: number | null;
}

export interface GetBlogsParams {
    pageIndex?: number;
    pageSize?: number;
    textSearch?: string;
    status?: 0 | 1 | 2;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface GetBloggerBlogsResponse {
    blogs: BlogPost[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}

// Payload for creating a blog post
export interface CreateBlogPayload {
    title: string;
    content: string;
    files?: File[];
}

// Payload for updating a blog post
export interface UpdateBlogPayload {
    id: string;
    title: string;
    content: string;
    files?: File[];
}
