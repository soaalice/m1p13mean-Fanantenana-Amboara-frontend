export interface UserProfilePreview {
    fullName: string;
    tel: string;
    solde: number;
    email?: string;
}

export interface OwnerUserPreview {
    _id: string;
    profile: UserProfilePreview;
}

export interface Shop {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    ownerUserId: string;
    ownerUser?: OwnerUserPreview;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}