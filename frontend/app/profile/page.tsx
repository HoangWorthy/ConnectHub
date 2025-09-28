"use client"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { account } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      // Redirect to the user's own profile page
      router.replace(`/profile/${account.id}`);
    }
  }, [account, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to your profile...</p>
        </div>
      </div>
    </div>
  )
}
