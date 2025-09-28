"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/contexts/profile-context"
import { updateProfile, getAvatarPresignUploadUrl, uploadAvatarToS3 } from "@/services/ProfileService"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { account } = useAuth()
  const { profile, refreshProfile } = useProfile()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile form state
  const [fullName, setFullName] = useState("")
  const [nickName, setNickName] = useState("")
  const [bio, setBio] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // UI state
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [publicProfile, setPublicProfile] = useState(true)

  // Auto-fill profile information when profile data is available
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "")
      setNickName(profile.nickName || "")
      setBio(profile.bio || "")
      setPhoneNumber(profile.phoneNumber || "")
      setAddress(profile.address || "")
    }
    if (account) {
      setEmail(account.email || "")
    }
  }, [profile, account])

  const handleAvatarSelect = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF).",
          variant: "destructive",
        })
        return
      }

      // Validate file size (1MB max)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 1MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedAvatar(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  const uploadAvatarToS3WithPresign = async (file: File): Promise<string> => {
    // Step 1: Get presign URL
    const presignResponse = await getAvatarPresignUploadUrl({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size
    })

    const { url, key } = presignResponse

    // Step 2: Upload to S3
    await uploadAvatarToS3(url, file)

    // Return the key to save in profile
    return key
  }
  
  const handleSaveProfile = async () => {
    setIsUpdating(true)
    try {
      let profilePicKey = undefined

      // If user selected a new avatar, upload it first
      if (selectedAvatar) {
        setIsUploadingAvatar(true)
        try {
          profilePicKey = await uploadAvatarToS3WithPresign(selectedAvatar)
          toast({
            title: "Avatar uploaded",
            description: "Your avatar has been uploaded successfully.",
          })
        } catch (error) {
          console.error("Failed to upload avatar:", error)
          toast({
            title: "Avatar upload failed",
            description: "Failed to upload your avatar. Saving other profile changes.",
            variant: "destructive",
          })
        } finally {
          setIsUploadingAvatar(false)
        }
      }

      if (profile) {
        await updateProfile({
          fullName: fullName.trim(),
          nickName: nickName.trim(),
          bio: bio.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          ...(profilePicKey && { profilePic: profilePicKey }),
          id: profile.id,
        })
      }
      
      // Clean up avatar selection and preview
      setSelectedAvatar(null)
      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh the profile context to get updated data
      await refreshProfile()
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSavePreferences = () => {
    // Mock save functionality - in real app, this would call an API
    console.log("Preferences saved:", { notifications, darkMode, publicProfile })
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarPreview || profile?.profilePic}/>
                      <AvatarFallback>{profile?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleAvatarSelect}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, GIF or PNG. 1MB max.
                        {selectedAvatar && (
                          <span className="text-primary block">
                            Selected: {selectedAvatar.name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nickName">Nickname</Label>
                        <Input 
                          id="nickName" 
                          value={nickName} 
                          onChange={(e) => setNickName(e.target.value)}
                          placeholder="Enter your nickname"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed from here</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input 
                          id="phoneNumber" 
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isUpdating || isUploadingAvatar}
                    className="w-full md:w-auto"
                  >
                    {isUploadingAvatar ? "Uploading Avatar..." : isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new messages and activity
                      </p>
                    </div>
                    <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the app looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                    </div>
                    <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="publicProfile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                    </div>
                    <Switch id="publicProfile" checked={publicProfile} onCheckedChange={setPublicProfile} />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Data Management</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Download Your Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
