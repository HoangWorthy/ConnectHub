package hoangworthy.project.microservices.servicepost.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeDtoResponse {
    private UUID id;
    private UUID accountId;
    private LocalDateTime createdAt;
}
