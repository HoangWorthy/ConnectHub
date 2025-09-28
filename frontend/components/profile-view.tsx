"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, LinkIcon, Calendar, Settings, Heart, MessageSquare, Share2, Bookmark } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { useState, useEffect, useRef, useCallback } from "react"
import { getMyPosts, getMyMedia } from "@/services/PostService"
import { Post } from "@/interfaces/Post"
import { usePost } from "@/contexts/post-context"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export function ProfileView() {
  const { profile } = useProfile();
  const { account } = useAuth();
  const { handleLikePost, handleDislikePost, handleCommentPost } = usePost();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Media state
  const [myMedia, setMyMedia] = useState<string[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isFetchingMoreMedia, setIsFetchingMoreMedia] = useState(false);
  const [hasMoreMedia, setHasMoreMedia] = useState(true);
  const [currentMediaPage, setCurrentMediaPage] = useState(0);
  const mediaLoaderRef = useRef<HTMLDivElement | null>(null);

  // Comment states for each post
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>({});
  const [isCommenting, setIsCommenting] = useState<{ [postId: string]: boolean }>({});

  const loadPosts = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!account) return;
    
    try {
      if (reset || page === 0) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await getMyPosts(page, 3, 'createdAt', false);
      const newPosts = response.content || response;
      
      if (reset || page === 0) {
        setMyPosts(newPosts);
        setCurrentPage(0);
      } else {
        setMyPosts(prev => [...prev, ...newPosts]);
      }
      
      // Check if there are more posts
      if (response.last !== undefined) {
        setHasMore(!response.last);
      } else {
        setHasMore(newPosts.length === 3);
      }
      
    } catch (error) {
      console.error('Failed to fetch my posts:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [account]);

  const handleFetchMore = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadPosts(nextPage, false);
  }, [loadPosts, isLoading, isFetchingMore, hasMore, currentPage]);

  useEffect(() => {
    loadPosts(0, true);
  }, [account]);

  // Media loading functions
  const loadMedia = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!account) return;
    
    try {
      if (reset || page === 0) {
        setIsLoadingMedia(true);
      } else {
        setIsFetchingMoreMedia(true);
      }

      const response = await getMyMedia(page, 12, 'createdAt', false); // Load 12 media items at a time
      const newMediaUrls = response.content || response;
      
      if (reset || page === 0) {
        setMyMedia(newMediaUrls);
        setCurrentMediaPage(0);
      } else {
        setMyMedia(prev => [...prev, ...newMediaUrls]);
      }
      
      // Check if there are more media
      if (response.last !== undefined) {
        setHasMoreMedia(!response.last);
      } else {
        setHasMoreMedia(newMediaUrls.length === 12);
      }
      
    } catch (error) {
      console.error('Failed to fetch my media:', error);
    } finally {
      setIsLoadingMedia(false);
      setIsFetchingMoreMedia(false);
    }
  }, [account]);

  const handleFetchMoreMedia = useCallback(async () => {
    if (isLoadingMedia || isFetchingMoreMedia || !hasMoreMedia) return;
    
    const nextPage = currentMediaPage + 1;
    setCurrentMediaPage(nextPage);
    await loadMedia(nextPage, false);
  }, [loadMedia, isLoadingMedia, isFetchingMoreMedia, hasMoreMedia, currentMediaPage]);

  // Intersection Observer for infinite scrolling (using posts-feed pattern)
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

  // Intersection Observer for media infinite scrolling
  useEffect(() => {
    if (!mediaLoaderRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleFetchMoreMedia();
        }
      },
      { threshold: 0.1 }
    );

    if (mediaLoaderRef.current) observer.observe(mediaLoaderRef.current);

    return () => {
      if (mediaLoaderRef.current) observer.unobserve(mediaLoaderRef.current);
    };
  }, [handleFetchMoreMedia]);

  // Comment functions
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = async (postId: string) => {
    const comment = newComments[postId]?.trim();
    if (!comment || isCommenting[postId] || !account) return;
    
    setIsCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      await handleCommentPost(postId as any, comment); // Cast to UUID type
      setNewComments(prev => ({ ...prev, [postId]: '' })); // Clear the comment input
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!account) return;
    
    try {
      if (isLiked) {
        await handleDislikePost(postId as any); // Cast to UUID type
      } else {
        await handleLikePost(postId as any); // Cast to UUID type
      }
    } catch (error) {
      console.error('Like/dislike failed:', error);
    }
  };

  // Tab change handler to load media when media tab is selected
  const handleTabChange = (value: string) => {
    if (value === 'media' && myMedia.length === 0 && !isLoadingMedia) {
      loadMedia(0, true);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatJoinDate = (date: Date | string) => {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return format(parsedDate, 'MMMM yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const getUsernameDisplay = () => {
    return profile.nickName ? `@${profile.nickName}` : `@${profile.fullName.toLowerCase().replace(/\s+/g, '')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg" />
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.profilePic} />
              <AvatarFallback className="text-2xl">{getInitials(profile.fullName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              <p className="text-muted-foreground">{getUsernameDisplay()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <p className="text-sm mb-4 max-w-2xl">{profile.bio || "No bio available"}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {profile.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.address}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatJoinDate(profile.createdAt)}
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold">{profile.followings || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold">{profile.friends?.length || 0}</span>
              <span className="text-muted-foreground ml-1">Friends</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {isLoading && myPosts.length === 0 ? (
            // Loading skeleton for initial load
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : myPosts.length > 0 ? (
            <>
              {myPosts.map((post) => {
                const isLiked = account && post.likes ? post.likes.some(like => like.accountId === account.id) : false;
                const likesCount = post.likes?.length || 0;
                const commentsCount = post.comments?.length || 0;
                
                return (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profile.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            {post.profile.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{post.profile.fullName}</span>
                            <span className="text-muted-foreground">
                              @{post.profile.nickName || post.profile.fullName.toLowerCase().replace(/\s+/g, '')}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground text-sm">
                              {format(new Date(post.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>

                          <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

                          {post.medias && post.medias.length > 0 && (
                            <div className="mb-3">
                              {post.medias.length === 1 ? (
                                <div className="rounded-lg overflow-hidden">
                                  <img
                                    src={post.medias[0].url || "/placeholder.svg"}
                                    alt="Post media"
                                    className="w-full max-h-96 object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`grid gap-2 rounded-lg overflow-hidden ${
                                  post.medias.length === 2 ? 'grid-cols-2' : 
                                  post.medias.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                                }`}>
                                  {post.medias.slice(0, 4).map((media, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={media.url || "/placeholder.svg"}
                                        alt={`Post media ${index + 1}`}
                                        className="w-full h-48 object-cover"
                                      />
                                      {index === 3 && post.medias.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                                          +{post.medias.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-muted-foreground">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-muted-foreground hover:text-red-500"
                              onClick={() => handleLike(post.id, isLiked)}
                            >
                              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                              {likesCount}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-muted-foreground hover:text-blue-500"
                              onClick={() => toggleComments(post.id)}
                            >
                              <MessageSquare className="h-4 w-4" />
                              {commentsCount}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-green-500">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-muted-foreground hover:text-yellow-500 ml-auto"
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Comments Section */}
                          {showComments[post.id] && (
                            <div className="mt-4 space-y-4">
                              <Separator />
                              
                              {/* Comment Input */}
                              <div className="flex gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={profile?.profilePic} />
                                  <AvatarFallback>
                                    {profile?.fullName
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder="Write a comment..."
                                    value={newComments[post.id] || ''}
                                    onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleComment(post.id);
                                      }
                                    }}
                                    disabled={isCommenting[post.id]}
                                  />
                                  <Button 
                                    onClick={() => handleComment(post.id)}
                                    disabled={!newComments[post.id]?.trim() || isCommenting[post.id]}
                                    size="sm"
                                  >
                                    {isCommenting[post.id] ? 'Posting...' : 'Post'}
                                  </Button>
                                </div>
                              </div>

                              {/* Comments List */}
                              <div className="space-y-3">
                                {post.comments?.map((comment) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={comment.profile?.profilePic || ''} />
                                      <AvatarFallback>
                                        {comment.profile?.fullName
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("")
                                          .toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-muted rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-medium">{comment.profile?.fullName || 'Anonymous'}</p>
                                          {comment.profile?.nickName && (
                                            <p className="text-xs text-muted-foreground">@{comment.profile?.nickName}</p>
                                          )}
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                
                                {(!post.comments || post.comments.length === 0) && (
                                  <p className="text-center text-muted-foreground text-sm py-4">
                                    No comments yet. Be the first to comment!
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Infinite Scroll Trigger - following posts-feed pattern */}
              {hasMore && (
                <div ref={loaderRef} className="py-4">
                  {isFetchingMore && (
                    <div className="flex justify-center">
                      <div className="rounded-lg border bg-card p-6 space-y-4 w-full">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-20 w-full bg-muted rounded animate-pulse" />
                        <div className="flex space-x-6">
                          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!hasMore && myPosts.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">You've reached the end!</p>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet</p>
                <p className="text-sm">Start sharing your thoughts with the community!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media">
          {isLoadingMedia && myMedia.length === 0 ? (
            // Loading skeleton for initial load
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : myMedia.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {myMedia.map((mediaUrl, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={mediaUrl}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Media Infinite Scroll Trigger */}
                {hasMoreMedia && (
                  <div ref={mediaLoaderRef} className="py-4 mt-6">
                    {isFetchingMoreMedia && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!hasMoreMedia && myMedia.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No more media to show</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center py-12">
                  <div className="h-16 w-16 bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">No media yet</p>
                  <p className="text-sm">Photos and videos from your posts will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="likes">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Liked posts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Saved posts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
