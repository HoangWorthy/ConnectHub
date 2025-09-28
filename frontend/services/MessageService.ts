import { axiosInstance, ENDPOINTS } from "@/lib/utils";
import { UUID } from "crypto";

export function getConversations(receiverId: UUID) {
    return axiosInstance.get(ENDPOINTS.MESSAGE.GET_CONVERSATIONS, {
        params: { receiverId }
    })
    .then(response => response.data);
}

export function getConversationMessages(conversationId: UUID) {
    return axiosInstance.get(ENDPOINTS.MESSAGE.GET_CONVERSATION_MESSAGES, {
        params: { conversationId }
    })
    .then(response => response.data);
}