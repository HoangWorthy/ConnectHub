import { UUID } from "crypto";

export interface Conversation {
    id: UUID;
    user1: UUID;
    user2: UUID;
    chatMessages?: Message[];
}

export interface Message {
    id: UUID,
    sender: UUID,
    receiver: UUID,
    content: string,
    contentType?: string,
    timestamp: string,
    conversationId: UUID;
}