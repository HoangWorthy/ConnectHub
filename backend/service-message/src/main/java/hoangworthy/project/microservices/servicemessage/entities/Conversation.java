package hoangworthy.project.microservices.servicemessage.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class Conversation {
    @Id
    private UUID id;

    private UUID user1;

    private UUID user2;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<ChatMessage> chatMessages;
}
