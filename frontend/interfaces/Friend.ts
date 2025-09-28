import { UUID } from "crypto";

export interface Friend {
    id: UUID,
    fullName: string,
    nickName: string,
    profilePic: string,
}