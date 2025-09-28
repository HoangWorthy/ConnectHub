import { Header } from "@/components/header"
import { PostsFeed } from "@/components/posts-feed"
import { Sidebar } from "@/components/sidebar"
import { PostProvider } from "@/contexts/post-context"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-3">
            <PostProvider>
              <PostsFeed />
            </PostProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
