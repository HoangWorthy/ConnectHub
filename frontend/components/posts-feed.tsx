"use client"

import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"
import { usePost } from "@/contexts/post-context"
import { Skeleton } from "./ui/skeleton";
import { useEffect, useRef, useCallback, useState } from "react";


export function PostsFeed() {
  const { posts, isLoading, hasMore, fetchPosts } = usePost();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleFetchMore = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    try {
      await fetchPosts();
    } catch (error) {
      console.error('Failed to fetch more posts:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [fetchPosts, isLoading, isFetchingMore, hasMore]);

  useEffect(() => {
    if (!loaderRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleFetchMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleFetchMore]);

  // Show skeleton only for initial loading, not for loading more
  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <CreatePost />
        <div className="space-y-4">
          {/* Show skeleton loaders while loading */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex space-x-6">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost />
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {/* Loader element for intersection observer */}
            {hasMore && (
              <div ref={loaderRef} className="py-4">
                {isFetchingMore && (
                  <div className="flex justify-center">
                    <div className="rounded-lg border bg-card p-6 space-y-4 w-full">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <div className="flex space-x-6">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">You've reached the end!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
