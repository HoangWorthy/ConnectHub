import { UUID } from "crypto";

export interface LikeNumber {
    id: UUID,
    accountId: UUID,
    createdAt: string
}