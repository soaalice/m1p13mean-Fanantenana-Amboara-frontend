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

export interface CreateCouponDto {
    code: string;
    expiresAt: string;
    percentage: number;
    type: 'PACK' | 'SINGLE';
    items: CouponItem[];
}