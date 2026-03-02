import { Product } from "./product";

export interface CouponItem {
    _id ?: string;
    name : string;
}

export interface Coupon {
    _id ?: string;
    code : string;
    expiresAt : string | Date;
    boutiqueId : string;
    percentage : number;
    type : 'PACK' | 'SINGLE';
    items : CouponItem[];    
}

export interface CouponDetails extends Coupon {
    _id : string;
    boutiqueName : string;
    code : string;
    expiresAt : string | Date;
    percentage : number;
    type : 'PACK' | 'SINGLE';
    items : Product[];
}

export interface CreateCouponDto {
    code: string;
    expiresAt: string;
    percentage: number;
    type: 'PACK' | 'SINGLE';
    items: CouponItem[];
}