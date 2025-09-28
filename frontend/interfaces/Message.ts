import { UUID } from "crypto";

export interface Message {
    id: UUID,
    sender: UUID,
    receiver: UUID,
    content: string,
    contentType?: string,
    timestamp: string,
    conversationId: UUID;
}