export enum TransactionType {
    RECHARGE = 'RECHARGE',
    PURCHASE = 'ACHAT'
}

export interface Transaction {
    _id ?: string;
    userId : string;
    total : number;
    type : TransactionType;
    date ?: string | Date;
}