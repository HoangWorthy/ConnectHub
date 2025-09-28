import { UUID } from "crypto";

export interface PresignRequest {
    fileName: string;
    contentType: string;
    fileSize: number;
    postId: UUID;
}