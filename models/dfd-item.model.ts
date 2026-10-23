import { Dfd } from './dfd.model';

export interface DfdItem {
  id: number;
  dfd_id: number;
  item_number: number;
  description: string;
  supply_unit: string;
  quantity: number;

  // Relacionamento opcional
  dfd?: Dfd;

  created_at?: string;
  updated_at?: string;
}