package hoangworthy.project.microservices.servicemessage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private UUID id;
    private String content;
    private UUID sender;
    private UUID receiver;
    private String contentType;
    private LocalDateTime timestamp;
    private UUID conversationId;
}