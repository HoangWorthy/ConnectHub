package hoangworthy.project.microservices.servicemessage.controllers;

import hoangworthy.project.microservices.servicemessage.dto.ChatMessageDto;
import hoangworthy.project.microservices.servicemessage.entities.ChatMessage;
import hoangworthy.project.microservices.servicemessage.entities.Conversation;
import hoangworthy.project.microservices.servicemessage.repositories.ConversationRepository;
import hoangworthy.project.microservices.servicemessage.repositories.MessageRepository;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/message")
public class MessageController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ConversationRepository conversationRepository;

    @MessageMapping("/chat.send")
    @Transactional
    public void sendMessage(ChatMessage message) {
        Conversation conversation = conversationRepository.findConversationBetweenUsers(message.getSender(), message.getReceiver());
        
        if (conversation == null) {
            Conversation newConversation = new Conversation();
            if (message.getConversation() != null && message.getConversation().getId() != null) {
                newConversation.setId(message.getConversation().getId());
            } else {
                newConversation.setId(UUID.randomUUID());
            }
            newConversation.setUser1(message.getSender());
            newConversation.setUser2(message.getReceiver());
            conversation = conversationRepository.save(newConversation);
        }
        
        message.setConversation(conversation);
        ChatMessage savedMessage = messageRepository.save(message);
        
        ChatMessageDto messageDto = new ChatMessageDto(
            savedMessage.getId(),
            savedMessage.getContent(),
            savedMessage.getSender(),
            savedMessage.getReceiver(),
            savedMessage.getContentType(),
            savedMessage.getTimestamp(),
            conversation.getId()
        );
        
        messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), messageDto);
    }


    @GetMapping("/conversation")
    public ResponseEntity<?> findAll(@AuthenticationPrincipal JwtUserDetails jwtUserDetails,
                                     @RequestParam UUID receiverId) {
        return ResponseEntity.ok().body(conversationRepository
                .findConversationBetweenUsers(jwtUserDetails.getAccountId(), receiverId));
    }

    @GetMapping("/conversation/messages")
    public ResponseEntity<List<ChatMessageDto>> getConversationMessages(
            @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
            @RequestParam UUID conversationId) {
        
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null || 
            (!conversation.getUser1().equals(jwtUserDetails.getAccountId()) && 
             !conversation.getUser2().equals(jwtUserDetails.getAccountId()))) {
            return ResponseEntity.notFound().build();
        }
        
        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        List<ChatMessageDto> messageDtos = messages.stream()
                .map(msg -> new ChatMessageDto(
                    msg.getId(),
                    msg.getContent(),
                    msg.getSender(),
                    msg.getReceiver(),
                    msg.getContentType(),
                    msg.getTimestamp(),
                    conversationId
                ))
                .toList();
        
        return ResponseEntity.ok(messageDtos);
    }
}
