import { Workplace } from './workplace.model';
import { Professional } from './professional.model';
import { DfdItem } from './dfd-item.model';
import { DfdMember } from './dfd-member.model';

export interface Dfd {
  id: number;
  dfd_number: string;
  workplace_id: number;
  owner_professional_id: number;
  validate_professional_id?: number | null;
  back_to_owner?: boolean;
  is_archived: boolean;
  is_valid: boolean;

  // 1. Objeto
  object_type: string;
  demand_description: string;

  // 2. Forma de Contratação Sugerida
  procurement_method: string;
  price_registration_identification?: string | null;
  price_registration_originating_notice?: string | null;
  price_registration_publication_date?: string | null;
  price_registration_expiration_date?: string | null;

  // ETP
  preliminary_technical_study_required: boolean;
  preliminary_technical_study_justification?: string | null;

  // 3. Justificativa
  need_justification: string;
  quantity_estimation_basis?: string | null;

  // 4. Previsão Orçamentária / PTA
  estimated_value?: number | null;
  budget_project_activity?: string | null;
  budget_expense_element?: string | null;
  budget_funding_source?: string | null;

  // 5 e 6. Prazos e Alinhamento Estratégico
  target_procurement_date: string;
  strategic_planning_alignment: string;

  // 7. Grau de Prioridade
  priority_level: string;

  // Relacionamentos (opcionais na resposta da API)
  workplace?: Workplace;
  owner_professional?: Professional;
  validate_professional?: Professional | null;
  items?: DfdItem[];
  members?: DfdMember[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  status?: boolean;
}