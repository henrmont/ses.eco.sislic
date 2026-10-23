import { User } from "../../core/models/user.model";
import { Professional } from "./professional.model";
import { Workplace } from "./workplace.model";

export interface SislicUser extends User {
    professional?: Professional;
}
