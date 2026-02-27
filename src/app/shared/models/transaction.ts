export enum TransactionType {
    RECHARGE = 'RECHARGE',
    PURCHASE = 'ACHAT',
    RENT = 'LOYER'
}

export interface Transaction {
    _id ?: string;
    userId : string;
    total : number;
    type : TransactionType;
    date ?: string | Date;
    rentId ?: string;
    periode ?: string;
}