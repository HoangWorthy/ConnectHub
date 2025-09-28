"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Smile, MapPin, Eye, Users, EyeOff, X } from "lucide-react"
import { usePost } from "@/contexts/post-context"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { useState, useRef } from "react"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS'>('PUBLIC')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { createNewPost } = usePost()
  const { account, loggedIn } = useAuth()
  const { profile } = useProfile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !loggedIn) return
    
    setIsPosting(true)
    try {
      await createNewPost(content, visibility, mediaFiles)
      // Reset form after successful post
      setContent("")
      setVisibility('PUBLIC')
      setMediaFiles([])
    } catch (error) {
      console.error('Failed to create post:', error)
      // You might want to show an error toast here
    } finally {
      setIsPosting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMediaFiles(prev => [...prev, ...files])
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'PUBLIC':
        return <Eye className="h-4 w-4" />
      case 'FRIENDS':
        return <Users className="h-4 w-4" />
      case 'PRIVATE':
        return <EyeOff className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  if (!loggedIn) {
    return null
  }

  const authorName = profile?.fullName || 'User'
  const authorAvatar = profile?.profilePic || "/placeholder.svg"

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>
                {authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                disabled={isPosting}
              />
              
              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMediaFile(index)}
                        disabled={isPosting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPosting}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Media
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-primary"
                    disabled={isPosting}
                  >
                    <Smile className="h-4 w-4" />
                    Emoji
                  </Button>
                  
                  {/* Visibility Selector */}
                  <Select 
                    value={visibility} 
                    onValueChange={(value: 'PUBLIC' | 'PRIVATE' | 'FRIENDS') => setVisibility(value)}
                    disabled={isPosting}
                  >
                    <SelectTrigger className="w-auto gap-2 border-0 bg-transparent p-0 h-auto text-primary">
                      {getVisibilityIcon(visibility)}                      
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">
                        <div className="flex items-center gap-2">
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="FRIENDS">
                        <div className="flex items-center gap-2">
                          Friends
                        </div>
                      </SelectItem>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit"
                  className="px-6" 
                  disabled={!content.trim() || isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </CardContent>
    </Card>
  )
}
