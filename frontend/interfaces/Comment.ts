import { UUID } from "crypto";
import { ProfilePost } from "./ProfilePost";

export interface Comment {
    id: UUID,
    profile: ProfilePost | null,
    content: string,
    createdAt: string
}