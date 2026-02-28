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
  totalItems: number;
  createdAt: string;
}
