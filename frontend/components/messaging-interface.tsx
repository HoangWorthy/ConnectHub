"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Send, Search, MoreVertical } from "lucide-react"
import { useState, useEffect } from "react"
import { useProfile } from "@/contexts/profile-context"
import { Friend } from "@/interfaces/Friend"
import { BACKEND_URL, WEBSOCKET_URL, ENDPOINTS } from "@/lib/utils"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { UUID } from "crypto"
import { Conversation } from "@/interfaces/Conversation"
import { getConversations, getConversationMessages } from "@/services/MessageService"

// Browser-compatible UUID generation
function generateUUID(): `${string}-${string}-${string}-${string}-${string}` {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`;
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}
import { Message } from "@/interfaces/Message"  

export function MessagingInterface() {
  const { profile } = useProfile()
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  
  const getConversation = async (friendId: UUID) => {
    try {
      const conversation = await getConversations(friendId)
      
      if (conversation) {
        setCurrentConversation(conversation)
        
        try {
          const savedMessages = await getConversationMessages(conversation.id)
          setMessages(savedMessages || [])
        } catch (error) {
          setMessages([])
        }
      } else {
        setCurrentConversation(null)
        setMessages([])
      }
    } catch (error) {
      setCurrentConversation(null)
      setMessages([])
    }
  }

  function handleSendMessage() {
    if (!stompClient || !stompClient.connected || !message.trim() || !selectedFriend || !profile) return;

    let conversation = currentConversation;
    if (!conversation) {
      conversation = {
        id: null as any,
        user1: profile.id,
        user2: selectedFriend.id,
        chatMessages: []
      };
    }

    const msg: Message = {
      id: generateUUID(),
      sender: profile.id,
      receiver: selectedFriend.id,
      content: message.trim(),
      contentType: "TEXT",
      timestamp: new Date().toISOString(),
      conversationId: conversation.id || generateUUID()
    }

    const backendMsg = {
      id: msg.id,
      sender: msg.sender,
      receiver: msg.receiver,
      content: msg.content,
      contentType: msg.contentType,
      timestamp: msg.timestamp,
      ...(currentConversation?.id && {
        conversation: {
          id: currentConversation.id,
          user1: currentConversation.user1,
          user2: currentConversation.user2
        }
      })
    }

    try {
      stompClient.publish({
        destination: ENDPOINTS.MESSAGE.SEND_MESSAGE,
        body: JSON.stringify(backendMsg)
      });
      
      setMessages(prev => [...prev, msg]);
      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  useEffect(() => {
    if (profile?.friends && profile.friends.length > 0 && !selectedFriend) {
      setSelectedFriend(profile.friends[0])
    }

    const client = new Client({
      webSocketFactory: () => {
        return new WebSocket(`${WEBSOCKET_URL}${ENDPOINTS.MESSAGE.CONNECT_WEBSOCKET}`);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setStompClient(client);
      },
      onStompError: (error: any) => {
        console.error('WebSocket connection failed:', error);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      }
    });
    
    client.activate();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    }
  }, [profile?.friends, selectedFriend, currentConversation])

  useEffect(() => {
    if (selectedFriend) {
      getConversation(selectedFriend.id);
    }
  }, [selectedFriend])

  useEffect(() => {
    if (stompClient && stompClient.connected && currentConversation) {
      const subscription = stompClient.subscribe(
        ENDPOINTS.MESSAGE.SUBSCRIBE_CONVERSATION(currentConversation.id), 
        (msg: any) => {
          try {
            const messageDto = JSON.parse(msg.body);
            
            // Convert DTO to Message interface
            const newMessage: Message = {
              id: messageDto.id,
              sender: messageDto.sender,
              receiver: messageDto.receiver,
              content: messageDto.content,
              contentType: messageDto.contentType,
              timestamp: messageDto.timestamp,
              conversationId: messageDto.conversationId
            };
            
            if (messageDto.sender !== profile?.id) {
              setMessages(prev => [...prev, newMessage]);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, currentConversation, profile?.id]);

  const filteredFriends = profile?.friends?.filter(friend => 
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.nickName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedFriend?.id === friend.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        {friend.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status - could be implemented later with WebSocket */}
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gray-400 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{friend.fullName}</p>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {friend.nickName ? `@${friend.nickName}` : "Start a conversation..."}
                    </p>
                  </div>
                  {/* Unread messages count - placeholder for now */}
                  <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center opacity-0">
                    0
                  </div>
                </div>
              ))
            ) : profile?.friends && profile.friends.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground">No friends yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add friends to start messaging!
                </p>
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground">No friends found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedFriend ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedFriend.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedFriend.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedFriend.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFriend.nickName ? `@${selectedFriend.nickName}` : "Friend"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === profile?.id ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender === profile?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${message.sender === profile?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start the conversation with {selectedFriend.fullName}!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                  disabled={!stompClient?.connected}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!stompClient?.connected || !message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!stompClient?.connected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Connecting to chat server...
                </p>
              )}
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                {profile?.friends && profile.friends.length > 0
                  ? "Select a friend from the list to start messaging"
                  : "Add friends to start messaging"}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
