import { UUID } from "crypto";

export interface Account {
    id: UUID;
    email: string;
    password: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}