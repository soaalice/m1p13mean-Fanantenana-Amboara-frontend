import { Box } from "./box";
import { User } from "./user";

export interface Shop {
    _id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    ownerUserId: string;
    ownerUser?: User;
    boxId?: string;
    assignedBox?: Box;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}