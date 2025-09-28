import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axios from 'axios' 
import { UUID } from 'crypto';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const WEBSOCKET_URL = BACKEND_URL?.replace("http", "ws");
export const ENDPOINTS = {
  AUTH:{
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  PROFILE:{
    GET_PROFILE: '/profile/me',
    GET_PROFILES: '/profile/get-profiles',
    GET_PROFILE_DETAIL: (profileId: UUID) => `/profile/${profileId}`,
    SEARCH_PROFILE: '/profile/search',
    UPDATE_PROFILE: '/profile/update',
    FOLLOW_PROFILE: (followerId: UUID) => `/profile/${followerId}/follow`,
    GET_PRESIGN_UPLOAD_URL: '/profile/avatar/s3/upload',
  },
  POST:{
    CREATE_POST: '/post/create',
    GET_FEED: '/post/feeds',
    GET_MY_POSTS: '/post/user/me',
    GET_USER_POSTS: (userId: UUID) => `/post/user/${userId}`,
    GET_MY_MEDIA: '/post/media/user/me',
    GET_USER_MEDIA: (userId: UUID) => `/post/media/user/${userId}`,
    GET_PRESIGN_UPLOAD_URL: '/post/media/s3/upload',
    GET_PRESIGN_DOWNLOAD_URL: '/post/media/s3/download',
    CONFIRM_UPLOAD: '/post/media/s3/confirm',
    LIKE_POST: (postId: UUID) => `/post/${postId}/like`,
    DISLIKE_POST: (postId: UUID) => `/post/${postId}/dislike`,
    COMMENT_POST: (postId: UUID) => `/post/${postId}/comment`,
  },
  MESSAGE: {
    GET_CONVERSATIONS: '/message/conversation',
    CONNECT_WEBSOCKET: '/message/ws',
    SUBSCRIBE_CONVERSATION: (conversationId: UUID) => `/topic/chat/${conversationId}`,
    SEND_MESSAGE: '/message/chat.send',
    GET_CONVERSATION_MESSAGES: '/message/conversation/messages',
  }
}

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
