export interface LoginRequest {
    email: string;
    password: string;
    reactive?: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    interests: string[];
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    interests?: string[];
    status: 'ACTIVE' | 'INACTIVE';
    isAdmin: boolean;
    isDeactivated: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    errors: any;
}
