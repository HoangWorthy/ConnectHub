'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './auth-context';
import { useProfile } from './profile-context';
import { Post } from '@/interfaces/Post';
import { createPost, getFeed, getPresignDownloadUrl, getPresignUploadUrl, uploadToS3, likePost, dislikePost, commentPost } from '@/services/PostService';
import { PresignRequest } from '@/interfaces/PresignRequest';
import imageCompression from 'browser-image-compression';
import { UUID } from 'crypto';
import { LikeNumber } from '@/interfaces/LikeNumber';
import { Comment as PostComment } from '@/interfaces/Comment';

interface PostContextType {
    posts: Post[];
    isLoading: boolean;
    hasMore: boolean;
    createNewPost: (content: string, visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS', media: File[]) => Promise<void>;
    fetchPosts: () => Promise<void>;
    refreshPosts: () => Promise<void>;
    handleLikePost: (postId: UUID) => Promise<void>;
    handleDislikePost: (postId: UUID) => Promise<void>;
    handleCommentPost: (postId: UUID, content: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { loggedIn, account } = useAuth();
    const { profile } = useProfile();
    const [pageNo, setPageNo] = useState(0);
    const initialFetchDone = useRef(false);

    const refreshPosts = useCallback(async () => {
        setIsLoading(true);
        setPageNo(0);
        setPosts([]);
        setHasMore(true);
        initialFetchDone.current = true; // Mark as fetched to prevent double calls
        
        try {
            const freshPosts: Post[] = await getFeed(0, 3, 'createdAt', false);
            console.log('🔍 Fresh posts from API:', freshPosts.map(p => ({ 
                id: p.id, 
                content: p.content?.substring(0, 50) + '...', 
                likeCount: p.likes?.length || 0,
                likes: p.likes?.map(like => ({ accountId: like.accountId, createdAt: like.createdAt }))
            })));
            setPosts(freshPosts);
            setPageNo(1); // Set to 1 since we just fetched page 0
            setHasMore(freshPosts.length >= 3); // Assume more if we got a full page
        } catch (error) {
            console.error('Failed to refresh posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPosts = useCallback(async () => {
        if (isLoading || !hasMore) return; // Don't fetch if already loading or no more posts
        
        setIsLoading(true);
        try {
            const newPosts: Post[] = await getFeed(pageNo, 3, 'createdAt', false);
            
            if (newPosts.length === 0) {
                setHasMore(false); // No more posts available
            } else {
                setPosts((prev) => [...prev, ...newPosts]);
                setPageNo((prev) => prev + 1);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pageNo, isLoading, hasMore])

    useEffect(() => {
        // Only fetch posts on initial mount, and prevent double fetching in Strict Mode
        if (!initialFetchDone.current) {
            refreshPosts();
        }
    }, [refreshPosts]);

    const createNewPost = async (content: string, visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS', media: File[]) => {
        if (!loggedIn) throw new Error('User must be logged in to create posts');

        try {
            const newPost = await createPost(content, visibility);
            const presignRequests: PresignRequest[] = media.map(file => ({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
                postId: newPost.id
            }));

            if (presignRequests.length > 0) {
                const presignUrls = await getPresignUploadUrl(presignRequests);
                const uploadPromises = presignUrls.map(async (presignResponse: any, i: number) => {
                    const file = media[i];
                    const url = presignResponse.url;
                    if (file.type.startsWith('image/')) {
                        const options = {
                            maxSizeMB: 0.2,
                            maxWidthOrHeight: 1024,   // shrink more aggressively
                            useWebWorker: true,
                            initialQuality: 0.8     // quality between 0 and 1
                        };
                        const compressedFile = await imageCompression(file, options);
                        return uploadToS3(url, compressedFile);
                    }
                    return uploadToS3(url, file);
                });
                await Promise.all(uploadPromises);
            }
            
            // Refresh posts to show the new post
            await refreshPosts();
        } catch (error) {
            console.error('Failed to create post or upload media:', error);
            throw error; // Re-throw to let the UI handle the error
        }
    };

    const handleLikePost = useCallback(async (postId: UUID) => {
        if (!loggedIn || !account) throw new Error('User must be logged in to like posts');

        try {
            // Check if user already liked the post and update optimistically
            setPosts((prevPosts) => {
                return prevPosts.map((post) => {
                    if (post.id === postId) {
                        const likes = post.likes || [];
                        const isAlreadyLiked = likes.some(like => like.accountId === account.id);
                        
                        if (isAlreadyLiked) {
                            console.log('Post already liked by user');
                            return post; // No change if already liked
                        }

                        // Add new like optimistically
                        const newLike: LikeNumber = {
                            id: crypto.randomUUID() as UUID,
                            accountId: account.id,
                            createdAt: new Date().toISOString()
                        };
                        
                        return {
                            ...post,
                            likes: [...likes, newLike]
                        };
                    }
                    return post;
                });
            });

            // Call API to like the post
            await likePost(postId);
            console.log('✅ Like API call successful for post:', postId);
        } catch (error) {
            console.error('Failed to like post:', error);
            throw error;
        }
    }, [loggedIn, account]);

    const handleDislikePost = useCallback(async (postId: UUID) => {
        if (!loggedIn || !account) throw new Error('User must be logged in to dislike posts');

        try {
            // Remove like optimistically
            setPosts((prevPosts) => {
                return prevPosts.map((post) => {
                    if (post.id === postId) {
                        const likes = post.likes || [];
                        const isLiked = likes.some(like => like.accountId === account.id);
                        
                        if (!isLiked) {
                            console.log('Post not liked by user');
                            return post; // No change if not liked
                        }

                        // Remove user's like
                        return {
                            ...post,
                            likes: likes.filter(like => like.accountId !== account.id)
                        };
                    }
                    return post;
                });
            });

            // Call API to dislike the post
            await dislikePost(postId);
            console.log('✅ Dislike API call successful for post:', postId);
        } catch (error) {
            console.error('Failed to dislike post:', error);
            throw error;
        }
    }, [loggedIn, account]);

    const handleCommentPost = useCallback(async (postId: UUID, content: string) => {
        if (!loggedIn || !account) throw new Error('User must be logged in to comment on posts');

        try {
            // Optimistically add the comment
            setPosts((prevPosts) => {
                return prevPosts.map((post) => {
                    if (post.id === postId) {
                        const newComment: PostComment = {
                            id: crypto.randomUUID() as UUID,
                            profile: {
                                fullName: profile?.fullName || 'Anonymous',
                                nickName: profile?.nickName || '',
                                profilePic: profile?.profilePic || ''
                            },
                            content: content,
                            createdAt: new Date().toISOString()
                        };

                        return {
                            ...post,
                            comments: [...(post.comments || []), newComment]
                        };
                    }
                    return post;
                });
            });

            // Call API to comment on the post
            await commentPost(postId, content);
            console.log('✅ Comment API call successful for post:', postId);
        } catch (error) {
            console.error('Failed to comment on post:', error);
            throw error;
        }
    }, [loggedIn, account]);

    return (
        <PostContext.Provider
            value={{
                posts,
                isLoading,
                hasMore,
                createNewPost,
                fetchPosts,
                refreshPosts,
                handleLikePost,
                handleDislikePost,
                handleCommentPost,
            }}
        >
            {children}
        </PostContext.Provider>
    );
}

export function usePost() {
    const context = useContext(PostContext);
    if (context === undefined) {
        throw new Error('usePost must be used within a PostProvider');
    }
    return context;
}