package hoangworthy.project.microservices.servicemessage.repositories;

import hoangworthy.project.microservices.servicemessage.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE (c.user1 = :userA AND c.user2 = :userB) OR (c.user1 = :userB AND c.user2 = :userA)")
    Conversation findConversationBetweenUsers(@Param("userA") UUID userA, @Param("userB") UUID userB);

}
