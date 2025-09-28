import { Header } from "@/components/header"
import { UserProfileView } from "@/components/user-profile-view"

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <UserProfileView userId={params.userId} />
      </div>
    </div>
  )
}