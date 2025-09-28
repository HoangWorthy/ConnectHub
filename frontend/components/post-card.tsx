"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, Share, MoreHorizontal, Eye, EyeOff, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { Post } from "@/interfaces/Post"
import { Profile } from "@/interfaces/Profile"
import { LocalDateTime, DateTimeFormatter } from "@js-joda/core"
import { getPresignDownloadUrl } from "@/services/PostService"
import { usePost } from "@/contexts/post-context"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  const { handleLikePost, handleDislikePost, handleCommentPost } = usePost();
  const { account } = useAuth();
  const { profile } = useProfile();

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
        await handleDislikePost(post.id);
      } else {
        await handleLikePost(post.id);
      }
    } catch (error) {
      console.error('Like/dislike failed:', error);
    } finally {
      setIsLiking(false);
    }
  }

  const handleComment = async () => {
    if (isCommenting || !account || !newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      await handleCommentPost(post.id, newComment.trim());
      setNewComment(''); // Clear the comment input
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setIsCommenting(false);
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments);
  }

  // Format the createdAt string to a readable string
  const formatDateTime = (createdAt: string | LocalDateTime): string => {
    try {
      // If it's a string (from API), parse it as ISO string and format
      if (typeof createdAt === 'string') {
        const date = new Date(createdAt);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // If it's a LocalDateTime object, use the original formatting
      else {
        const formatter = DateTimeFormatter.ofPattern('MMM d, yyyy HH:mm');
        return createdAt.format(formatter);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  }

  // Get visibility icon
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Eye className="h-3 w-3" />
      case 'FRIENDS':
        return <Users className="h-3 w-3" />
      case 'PRIVATE':
        return <EyeOff className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  // Render individual media item
  const renderMedia = (media: any, index: number, isOverlay: boolean) => {
    const isImage = media.type.startsWith('image/');
    const isVideo = media.type.startsWith('video/');

    if (isImage) {
      return (
        <img
          src={media.url}
          alt="Post media"
          className="w-full h-full min-h-[120px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(media.url, '_blank')}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={media.url}
          controls
          className="w-full h-full min-h-[120px] max-h-[200px] object-cover"
          preload="metadata"
        />
      );
    }

    return (
      <div className="p-3 bg-muted rounded-lg min-h-[120px] flex flex-col justify-center">
        <p className="text-xs text-muted-foreground mb-2">
          Attachment: {media?.type || 'Unknown file type'}
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href={media.url} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Card className="hover:bg-muted/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profile.profilePic} />
            <AvatarFallback>
              {post.profile.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{post.profile.fullName}</h4>
                {post.profile.nickName && (
                  <>
                    <span className="text-muted-foreground">@{post.profile.nickName}</span>
                    <span className="text-muted-foreground">·</span>
                  </>
                )}
                <span className="text-muted-foreground text-sm">
                  {formatDateTime(post.createdAt)}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getVisibilityIcon(post.visibility)}
                  <span className="text-xs capitalize">{post.visibility.toLowerCase()}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Render media if available */}
            {post.medias && post.medias.length > 0 && (
              <div className="rounded-lg overflow-hidden">
                {post.medias.length === 1 && (
                  <div className="rounded-lg overflow-hidden border">
                    {renderMedia(post.medias[0], 0, false)}
                  </div>
                )}
                
                {post.medias.length === 2 && (
                  <div className="flex gap-2">
                    {post.medias.slice(0, 2).map((media, index) => (
                      <div key={media?.id || index} className="flex-1 rounded-lg overflow-hidden border">
                        {renderMedia(media, index, false)}
                      </div>
                    ))}
                  </div>
                )}
                
                {post.medias.length === 3 && (
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg overflow-hidden border">
                      {renderMedia(post.medias[0], 0, false)}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="rounded-lg overflow-hidden border">
                        {renderMedia(post.medias[1], 1, false)}
                      </div>
                      <div className="rounded-lg overflow-hidden border">
                        {renderMedia(post.medias[2], 2, false)}
                      </div>
                    </div>
                  </div>
                )}
                
                {post.medias.length >= 4 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.medias.slice(0, 4).map((media, index) => (
                      <div key={media?.id || index} className="rounded-lg overflow-hidden border relative">
                        {renderMedia(media, index, post.medias.length > 4 && index === 3)}
                        {post.medias.length > 4 && index === 3 && (
                          <div 
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:bg-black/70 transition-colors"
                            onClick={() => {
                              console.log('Open gallery with all media');
                            }}
                          >
                            +{post.medias.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-red-500"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                {likesCount}
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-blue-500"
                onClick={toggleComments}
              >
                <MessageCircle className="h-4 w-4" />
                {commentsCount}
              </Button>

              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-green-500">
                <Share className="h-4 w-4" />
                0
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
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
                            <p className="text-sm font-medium">{comment.profile?.fullName || 'Anonymous'}</p>
                            {comment.profile?.nickName && (
                              <p className="text-xs text-muted-foreground">@{comment.profile.nickName}</p>
                            )}
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(comment.createdAt)}
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
  )
}
