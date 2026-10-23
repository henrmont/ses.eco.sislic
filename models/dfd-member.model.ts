import { Dfd } from './dfd.model';
import { Professional } from './professional.model';

export interface DfdMember {
  id: number;
  dfd_id: number;
  professional_id: number;
  role?: string | null;

  // Relacionamentos opcionais
  dfd?: Dfd;
  professional?: Professional;

  created_at?: string;
  updated_at?: string;
}