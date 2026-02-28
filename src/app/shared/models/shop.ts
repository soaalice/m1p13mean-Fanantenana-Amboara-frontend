import { Box } from "./box";
import { Rent } from "./rent";
import { User } from "./user";

export interface Shop {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    ownerUserId: string;
    ownerUser?: User;
    boxId?: string;
    assignedBox?: Box;
    photoUrl?: string;
    photoPath?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    activeRent?: Rent;
}