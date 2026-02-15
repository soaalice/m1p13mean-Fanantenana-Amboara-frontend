export interface Shop {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    ownerUserId: string;
}