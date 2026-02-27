import { Transaction } from "./transaction";

export interface Rent {
    _id ?: string;
    shopId : string;
    boxId : string;
    amount : number;
    startDate : string | Date;
    nextDeadline ?: string | Date;
    status : 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}