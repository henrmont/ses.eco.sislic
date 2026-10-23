export interface Workplace {
  id?: number;
  pivot?: any,
  parent_id?: number | null;
  name?: string;
  budget_entity?: string;
  created_at?: string;
  updated_at?: string;
  parent?: Workplace;
  children?: Workplace[];
}