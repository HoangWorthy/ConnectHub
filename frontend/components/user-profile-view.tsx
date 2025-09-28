"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, LinkIcon, Calendar, Settings, Heart, MessageSquare, Share2, Bookmark, UserPlus, UserCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { format } from "date-fns"
import { useState, useEffect, useRef, useCallback } from "react"
import { getUserPosts, getUserMedia, commentPost, likePost, dislikePost } from "@/services/PostService"
import { getProfileDetail, followProfile } from "@/services/ProfileService"
import { Post } from "@/interfaces/Post"
import { Profile } from "@/interfaces/Profile"
import { PostCard } from "@/components/post-card"
import { usePost } from "@/contexts/post-context"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface UserProfileViewProps {
  userId: string
}

// Custom post component for UserProfileView that works with local state
interface LocalPostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onDislike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
}

function LocalPostCard({ post, onLike, onDislike, onComment }: LocalPostCardProps) {
  const { account } = useAuth();
  const { profile } = useProfile();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Check if current user liked the post and update counts
  useEffect(() => {
    if (account && post.likes) {
      const userLiked = post.likes.some(like => like.accountId === account.id);
      setIsLiked(userLiked);
    } else {
      setIsLiked(false);
    }
    setLikesCount(post.likes?.length || 0);
    setCommentsCount(post.comments?.length || 0);
  }, [post.likes, post.comments, account]);

  const handleLike = async () => {
    if (isLiking || !account) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await onDislike(post.id);
      } else {
        await onLike(post.id);
      }
    } catch (error) {
      console.error('Like/dislike failed:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (isCommenting || !account || !newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(post.id, newComment.trim());
      setNewComment(''); // Clear the comment input
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Format the createdAt string to a readable string
  const formatDateTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  return (
    <Card>
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
                {formatDateTime(post.createdAt)}
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
                className={`gap-2 hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
                disabled={!account || isLiking}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                {likesCount}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-blue-500"
                onClick={toggleComments}
                disabled={!account}
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
            {showComments && account && (
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
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                      disabled={isCommenting}
                    />
                    <Button 
                      onClick={handleComment}
                      disabled={!newComment.trim() || isCommenting}
                      size="sm"
                    >
                      {isCommenting ? 'Posting...' : 'Post'}
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
                            <p className="text-sm font-medium">{comment.profile?.fullName || 'User'}</p>
                            {comment.profile?.nickName && (
                              <p className="text-xs text-muted-foreground">@{comment.profile?.nickName}</p>
                            )}
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(comment.createdAt)}
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
}

export function UserProfileView({ userId }: UserProfileViewProps) {
  const { account } = useAuth();
  const { profile } = useProfile();
  const { posts: contextPosts } = usePost(); // Get posts from context to sync updates
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  
  // Posts state
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Media state
  const [userMedia, setUserMedia] = useState<string[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isFetchingMoreMedia, setIsFetchingMoreMedia] = useState(false);
  const [hasMoreMedia, setHasMoreMedia] = useState(true);
  const [currentMediaPage, setCurrentMediaPage] = useState(0);
  const mediaLoaderRef = useRef<HTMLDivElement | null>(null);

  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoadingProfile(true);
        const profile = await getProfileDetail(userId as any);
        setUserProfile(profile);
        
        // Check if current user is following this profile
        if (account && profile.friends) {
          const isCurrentlyFollowing = profile.friends.some((friend: any) => friend.id === account.id);
          setIsFollowing(isCurrentlyFollowing);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [userId, account]);

  // Load user posts
  const loadPosts = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!userId) return;
    
    try {
      if (reset || page === 0) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await getUserPosts(userId as any, page, 3, 'createdAt', false);
      const newPosts = response.content || response;
      
      if (reset || page === 0) {
        setUserPosts(newPosts);
        setCurrentPage(0);
      } else {
        setUserPosts(prev => [...prev, ...newPosts]);
      }
      
      // Check if there are more posts
      if (response.last !== undefined) {
        setHasMore(!response.last);
      } else {
        setHasMore(newPosts.length === 3);
      }
      
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [userId]);

  const handleFetchMore = useCallback(async () => {
    if (isLoading || isFetchingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadPosts(nextPage, false);
  }, [loadPosts, isLoading, isFetchingMore, hasMore, currentPage]);

  // Load user media
  const loadMedia = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!userId) return;
    
    try {
      if (reset || page === 0) {
        setIsLoadingMedia(true);
      } else {
        setIsFetchingMoreMedia(true);
      }

      const response = await getUserMedia(userId as any, page, 12, 'createdAt', false);
      const newMediaUrls = response.content || response;
      
      if (reset || page === 0) {
        setUserMedia(newMediaUrls);
        setCurrentMediaPage(0);
      } else {
        setUserMedia(prev => [...prev, ...newMediaUrls]);
      }
      
      // Check if there are more media
      if (response.last !== undefined) {
        setHasMoreMedia(!response.last);
      } else {
        setHasMoreMedia(newMediaUrls.length === 12);
      }
      
    } catch (error) {
      console.error('Failed to fetch user media:', error);
    } finally {
      setIsLoadingMedia(false);
      setIsFetchingMoreMedia(false);
    }
  }, [userId]);

  const handleFetchMoreMedia = useCallback(async () => {
    if (isLoadingMedia || isFetchingMoreMedia || !hasMoreMedia) return;
    
    const nextPage = currentMediaPage + 1;
    setCurrentMediaPage(nextPage);
    await loadMedia(nextPage, false);
  }, [loadMedia, isLoadingMedia, isFetchingMoreMedia, hasMoreMedia, currentMediaPage]);

  // Load initial posts and add them to context for PostCard to work properly
  useEffect(() => {
    if (userId) {
      loadPosts(0, true);
    }
  }, [userId]);

  // Sync PostContext updates with local userPosts state
  // This ensures that when PostCard components make updates (like comments/likes) 
  // they are reflected in the UserProfileView posts
  useEffect(() => {
    console.log('Sync effect triggered:');
    console.log('contextPosts count:', contextPosts.length);
    console.log('userPosts count:', userPosts.length);
    
    if (userPosts.length > 0) {
      console.log('userPosts IDs:', userPosts.map(p => p.id));
    }
    if (contextPosts.length > 0) {
      console.log('contextPosts IDs:', contextPosts.map(p => p.id));
    }
    
    if (contextPosts.length > 0 && userPosts.length > 0) {
      setUserPosts(prevUserPosts => {
        const updatedPosts = prevUserPosts.map(userPost => {
          // Find the corresponding post in context posts
          const contextPost = contextPosts.find(cp => cp.id === userPost.id);
          if (contextPost) {
            console.log(`Syncing post ${userPost.id}: comments ${userPost.comments?.length} -> ${contextPost.comments?.length}`);
            // Update the user post with context post data (preserves comments/likes updates)
            return {
              ...userPost,
              likes: contextPost.likes,
              comments: contextPost.comments
            };
          }
          return userPost;
        });
        return updatedPosts;
      });
    }
  }, [contextPosts]);

  // Intersection Observer for posts infinite scrolling
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

  // Custom handlers that update local userPosts state (like post-card but for local state)
  const handleLocalCommentPost = useCallback(async (postId: string, content: string) => {
    if (!account || !profile) {
      throw new Error('User must be logged in to comment');
    }

    try {
      // Optimistically add the comment to local state (like PostContext does)
      setUserPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newComment = {
              id: crypto.randomUUID() as any,
              profile: {
                fullName: profile.fullName,
                nickName: profile.nickName,
                profilePic: profile.profilePic
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
        })
      );

      // Call API
      await commentPost(postId as any, content);
      console.log('✅ Local comment added successfully');
    } catch (error) {
      console.error('Failed to add local comment:', error);
      throw error;
    }
  }, [account, profile]);

  const handleLocalLikePost = useCallback(async (postId: string) => {
    if (!account) {
      throw new Error('User must be logged in to like posts');
    }

    try {
      // Optimistically add the like to local state (like PostContext does)
      setUserPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const likes = post.likes || [];
            const isAlreadyLiked = likes.some(like => like.accountId === account.id);
            
            if (isAlreadyLiked) {
              console.log('Post already liked by user');
              return post; // No change if already liked
            }

            // Add new like
            const newLike = {
              id: crypto.randomUUID() as any,
              accountId: account.id,
              createdAt: new Date().toISOString()
            };

            return {
              ...post,
              likes: [...likes, newLike]
            };
          }
          return post;
        })
      );

      // Call API
      await likePost(postId as any);
      console.log('✅ Local like added successfully');
    } catch (error) {
      console.error('Failed to like post locally:', error);
      throw error;
    }
  }, [account]);

  const handleLocalDislikePost = useCallback(async (postId: string) => {
    if (!account) {
      throw new Error('User must be logged in to dislike posts');
    }

    try {
      // Optimistically remove the like from local state (like PostContext does)
      setUserPosts(prevPosts => 
        prevPosts.map(post => {
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
        })
      );

      // Call API
      await dislikePost(postId as any);
      console.log('✅ Local dislike successful');
    } catch (error) {
      console.error('Failed to dislike post locally:', error);
      throw error;
    }
  }, [account]);

  const handleFollow = async () => {
    if (!account || !userId || isFollowingLoading) return;
    
    setIsFollowingLoading(true);
    try {
      await followProfile(userId as any);
      setIsFollowing(true);
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  // Tab change handler to load media when media tab is selected
  const handleTabChange = (value: string) => {
    if (value === 'media' && userMedia.length === 0 && !isLoadingMedia) {
      loadMedia(0, true);
    }
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  if (isLoadingProfile) {
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

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">User not found</p>
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
    return userProfile.nickName ? `@${userProfile.nickName}` : `@${userProfile.fullName.toLowerCase().replace(/\s+/g, '')}`;
  };

  const isOwnProfile = account?.id === userId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg" />
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={userProfile.profilePic} />
              <AvatarFallback className="text-2xl">{getInitials(userProfile.fullName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{userProfile.fullName}</h1>
              <p className="text-muted-foreground">{getUsernameDisplay()}</p>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleFollow}
                    disabled={isFollowingLoading || isFollowing}
                    className={isFollowing ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isFollowingLoading ? 'Following...' : 'Follow'}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {userProfile.bio && (
            <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {userProfile.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {userProfile.address}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatJoinDate(userProfile.createdAt)}
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-foreground">{userProfile.followings}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{userProfile.friends?.length || 0}</span>
              <span className="text-muted-foreground ml-1">Friends</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {isLoading && userPosts.length === 0 ? (
            // Loading skeleton for initial load
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-20 w-full bg-muted rounded animate-pulse mb-4" />
                    <div className="flex space-x-6">
                      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : userPosts.length > 0 ? (
            <>
              {userPosts.map((post) => (
                <LocalPostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLocalLikePost}
                  onDislike={handleLocalDislikePost}
                  onComment={handleLocalCommentPost}
                />
              ))}

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
              
              {!hasMore && userPosts.length > 0 && (
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
                <p className="text-sm">{isOwnProfile ? "Start sharing your thoughts with the community!" : `${userProfile.fullName} hasn't shared anything yet`}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media">
          {isLoadingMedia && userMedia.length === 0 ? (
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
          ) : userMedia.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userMedia.map((mediaUrl, index) => (
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
                  <div ref={mediaLoaderRef} className="py-4">
                    {isFetchingMoreMedia && (
                      <div className="flex justify-center">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!hasMoreMedia && userMedia.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">You've reached the end!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No media yet</p>
                <p className="text-sm">{isOwnProfile ? "Share some photos or videos to get started!" : `${userProfile.fullName} hasn't shared any media yet`}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}