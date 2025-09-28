package hoangworthy.project.microservices.servicemessage.repositories;

import hoangworthy.project.microservices.servicemessage.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findAllBySender(UUID accountId);
    List<ChatMessage> findByConversationIdOrderByTimestampAsc(UUID conversationId);
    
    // Debug method to check if messages exist
    List<ChatMessage> findByConversationId(UUID conversationId);
}
