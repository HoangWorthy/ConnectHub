package hoangworthy.project.microservices.servicepost.dtos;

import hoangworthy.project.microservices.servicepost.entities.ProfilePost;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDtoResponse {
    private UUID id;
    private String content;
    private LocalDateTime createdAt;
    private ProfilePostDto profile;
}
