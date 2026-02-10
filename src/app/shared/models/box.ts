// box.model.ts
export interface Box {
  _id: string;
  label: string;
  state: 'AVAILABLE' | 'RENTED' | 'REPAIR';
  rent: number;
}

