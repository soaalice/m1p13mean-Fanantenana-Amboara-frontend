export interface CommandItem {
  produit: {
    _id: string;
    name: string;
    price: number;
    qte: number;
  };
}

export interface Command {
  _id: string;
  acheteur: { _id: string; name: string };
  boutique: { _id: string; name: string };
  transactionId: string;
  items: CommandItem[];
  totalAmount: number;
  totalBeforeDiscount?: number | null;
  discount?: number;
  couponId?: string | null;
  totalItems: number;
  createdAt: string;
}
