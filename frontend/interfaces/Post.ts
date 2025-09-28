import { UUID } from "crypto";
import { LikeNumber } from "./LikeNumber";
import { Media } from "./Media";
import { ProfilePost } from "./ProfilePost";
import { Comment } from "./Comment";
export interface Post {
    id: UUID,
    profile: ProfilePost,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS',
    medias: Media[],
    createdAt: string,
    comments: Comment[]
    likes: LikeNumber[],
}