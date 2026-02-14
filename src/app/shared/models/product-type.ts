export interface ProductTypeAttribute {
  code: string;
  type: 'ENUM' | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'DATE';
  values?: string[];
  min?: number;
  max?: number;
}

export interface ProductType {
  _id: string;
  label: string;
  attributes?: ProductTypeAttribute[];
}