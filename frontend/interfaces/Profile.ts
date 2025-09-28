import { UUID } from "crypto";
import { Friend } from "./Friend";

export interface Profile {
    id: UUID,
    fullName: string,
    nickName: string,
    bio: string,
    profilePic: string,
    phoneNumber: string,
    address: string,
    followings: number,
    friends: Friend[],
    createdAt: Date,
    updatedAt: Date,
}