import { Header } from "@/components/header"
import { MessagingInterface } from "@/components/messaging-interface"

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <MessagingInterface />
      </div>
    </div>
  )
}
