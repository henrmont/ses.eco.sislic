import { Workplace } from './workplace.model';

export interface ProfessionalWorkplace {
  id: number;
  professional_id: number;
  workplace_id: number;
  pivot?: any,
  workplace?: Workplace;
}