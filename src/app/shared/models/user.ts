export enum UserRole {
    ADMIN = 'ADMIN',
    BOUTIQUE = 'BOUTIQUE',
    ACHETEUR = 'ACHETEUR'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface UserProfile {
    fullName : string;
    tel : string;
    solde : number;
}

export interface User {
    _id ?: string;
    role : UserRole;
    login : string;
    password ?: string;
    profile : UserProfile;
    status ?: UserStatus;
    createdAt ?: string | Date;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}