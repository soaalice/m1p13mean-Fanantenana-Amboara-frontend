export interface CartItem {
  produitId: string;
  nom: string;
  prix: number;
  qte: number;
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
