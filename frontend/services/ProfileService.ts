import { AvatarPresignRequest } from "@/interfaces/AvatarPresignRequest";
import { axiosInstance, ENDPOINTS } from "@/lib/utils";
import { UUID } from "crypto";

export function getCurrentProfile() {
    return axiosInstance.get(ENDPOINTS.PROFILE.GET_PROFILE)
    .then(response => response.data);
}

export function updateProfile(profileData: {
    fullName?: string;
    nickName?: string;
    bio?: string;
    phoneNumber?: string;
    address?: string;
    profilePic?: string;
    id: UUID;
}) {
    return axiosInstance.put(ENDPOINTS.PROFILE.UPDATE_PROFILE, profileData)
    .then(response => response.data);
}
export function getProfileDetail(profileId: UUID) {
    return axiosInstance.get(ENDPOINTS.PROFILE.GET_PROFILE_DETAIL(profileId))
    .then(response => response.data);
}

export function getProfiles(pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.PROFILE.GET_PROFILES, {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}

export function searchProfiles(name: string) {
    return axiosInstance.get(ENDPOINTS.PROFILE.SEARCH_PROFILE, {
        params: { name }
    }).then(res => res.data);
}

export function followProfile(followerId: UUID) {
    return axiosInstance.post(ENDPOINTS.PROFILE.FOLLOW_PROFILE(followerId))
    .then(response => response.data);
}

export function getAvatarPresignUploadUrl(presignRequest: AvatarPresignRequest) {
    return axiosInstance.post(ENDPOINTS.PROFILE.GET_PRESIGN_UPLOAD_URL, presignRequest)
        .then(res => res.data);
}

export function uploadAvatarToS3(presignUrl: string, file: File) {

    return axiosInstance.put(presignUrl, file, {
        headers: {
            'Content-Type': file.type,
        }
    });
}