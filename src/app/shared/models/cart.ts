export interface CartItem {
  produitId: string;
  nom: string;
  prix: number;
  qte: number;
  shop?: {
    _id: string;
    name: string;
  };
}

export type CartState = 'PENDING' | 'VALIDATE';

export interface Cart {
  _id?: string;
  acheteurId?: string;
  items: CartItem[];
  total: number;
  date?: string;
  etat: CartState;
}
