import { Media } from "@/interfaces/Media";
import { PresignRequest } from "@/interfaces/PresignRequest";
import { axiosInstance, ENDPOINTS } from "@/lib/utils";
import { UUID } from "crypto";

export function createPost(content: string, visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS') {
    return axiosInstance.post(ENDPOINTS.POST.CREATE_POST, { content, visibility })
        .then(res => res.data);
}

export function getFeed(pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.POST.GET_FEED, {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}

export function getMyPosts(pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.POST.GET_MY_POSTS, {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}

export function getPresignUploadUrl(presignRequests: PresignRequest[]) {
    return axiosInstance.post(ENDPOINTS.POST.GET_PRESIGN_UPLOAD_URL, presignRequests)
        .then(res => res.data);
}

export function getPresignDownloadUrl(media: Media[]) {
    return axiosInstance.post(ENDPOINTS.POST.GET_PRESIGN_DOWNLOAD_URL, media)
        .then(res => res.data);
}

export function confirmUpload(key: string) {
    return axiosInstance.post(ENDPOINTS.POST.CONFIRM_UPLOAD, null, { params: { key } })
        .then(res => res.data);
}

export function uploadToS3(presignUrl: string, file: File) {

    return axiosInstance.put(presignUrl, file, {
        headers: {
            'Content-Type': file.type,
        }
    });
}

export function likePost(postId: UUID) {
    console.log('📤 Sending like request for post:', postId);
    return axiosInstance.post(ENDPOINTS.POST.LIKE_POST(postId))
        .then(res => {
            console.log('📥 Like response:', res.data);
            return res.data;
        })
        .catch(err => {
            console.error('❌ Like request failed:', err.response?.data || err.message);
            throw err;
        });
}

export function dislikePost(postId: UUID) {
    console.log('📤 Sending dislike request for post:', postId);
    return axiosInstance.post(ENDPOINTS.POST.DISLIKE_POST(postId))
        .then(res => {
            console.log('📥 Dislike response:', res.data);
            return res.data;
        })
        .catch(err => {
            console.error('❌ Dislike request failed:', err.response?.data || err.message);
            throw err;
        });
}

export function commentPost(postId: UUID, content: string) {
    return axiosInstance.post(ENDPOINTS.POST.COMMENT_POST(postId), null, { params: { content } })
        .then(res => res.data);
}

export function getMyMedia(pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.POST.GET_MY_MEDIA, {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}

export function getUserPosts(userId: UUID, pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.POST.GET_USER_POSTS(userId), {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}

export function getUserMedia(userId: UUID, pageNo: number, size: number, sortBy: string, ascending: boolean) {
    return axiosInstance.get(ENDPOINTS.POST.GET_USER_MEDIA(userId), {
        params: { pageNo, size, sortBy, ascending }
    }).then(res => res.data);
}