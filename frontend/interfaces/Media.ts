import { UUID } from "crypto";

export interface Media {
    id: UUID,
    key: string,
    type: string,
    status: 'AVAILABLE' | 'PENDING' | 'FAILED',
    url: string
}