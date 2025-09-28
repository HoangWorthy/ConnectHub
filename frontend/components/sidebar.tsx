"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { getProfiles, followProfile } from "@/services/ProfileService"
import { Profile } from "@/interfaces/Profile"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"



export function Sidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const { account } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        setIsLoadingUsers(true);
        // Fetch more users to account for filtering out current user and friends
        const users = await getProfiles(0, 10, 'createdAt', false);
        
        // Filter out current user and users who are already friends, then limit to 3 suggestions
        const filteredUsers = users
          .filter((user: Profile) => {
            // Don't show current user
            if (user.id === account?.id) return false;
            
            // Don't show users who are already friends
            if (profile?.friends && profile.friends.some(friend => friend.id === user.id)) return false;
            
            return true;
          })
          .slice(0, 3);
          
        setSuggestedUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // Only fetch if we have account info
    if (account) {
      fetchSuggestedUsers();
    }
  }, [account, profile]);

  const handleFollow = async (userId: string) => {
    if (!account) return;

    try {
      // Optimistically update UI
      setFollowingUsers(prev => new Set(prev).add(userId));
      
      // Call API to follow the user
      await followProfile(userId as any); // Cast to UUID type
      console.log('Successfully followed user:', userId);
    } catch (error) {
      console.error('Failed to follow user:', error);
      // Revert optimistic update on error
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.profilePic} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{profile?.fullName}</h3>
              {profile?.nickName && <p className="text-sm text-muted-foreground">@{profile?.nickName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-semibold">{profile?.followings}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div>
              <p className="font-semibold">{profile?.friends.length || 0}</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friends */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Your Friends</h3>
          </div>
          <div className="space-y-3">
            {profile?.friends && profile.friends.length > 0 ? (
              profile.friends.slice(0, 3).map((friend) => (
                <Link key={friend.id} href={`/profile/${friend.id}`}>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md -m-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        {friend.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{friend.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{friend.nickName || friend.fullName.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No friends yet</p>
                <p className="text-xs text-muted-foreground">Start following people to build your network!</p>
              </div>
            )}
          </div>
          {profile?.friends && profile.friends.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/friends">
                <Button variant="ghost" className="w-full justify-center text-primary">
                  {profile.friends.length > 3 ? `View all friends (${profile.friends.length})` : 'View friends'}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Who to follow</h3>
          </div>
          <div className="space-y-4">
            {isLoadingUsers ? (
              // Loading skeleton
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-2 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">@{user.nickName || user.fullName.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                  </Link>
                  <Button 
                    size="sm" 
                    variant={followingUsers.has(user.id) ? "secondary" : "outline"}
                    onClick={() => handleFollow(user.id)}
                    disabled={followingUsers.has(user.id)}
                  >
                    {followingUsers.has(user.id) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))
            )}
          </div>
          
          {/* Find More People Button */}
          <div className="mt-4 pt-4 border-t">
            <Link href="/discover">
              <Button variant="ghost" className="w-full justify-center text-primary">
                Find more people
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
