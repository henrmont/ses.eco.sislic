import { ProfessionalType } from "./professional-type.model";
import { SislicUser } from "./user.model";
import { Workplace } from "./workplace.model";

export interface Professional {
    id: number,
    user_id: number,
    name: string,
    phone: string,
    registration: string,
    user: SislicUser,
    types: ProfessionalType[] | null,
    workplaces?: Workplace[];
}
