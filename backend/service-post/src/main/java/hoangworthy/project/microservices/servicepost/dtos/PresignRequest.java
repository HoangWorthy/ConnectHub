package hoangworthy.project.microservices.servicepost.dtos;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PresignRequest {
    private String fileName;
    private String contentType;
    private long fileSize;
    private UUID postId;
}
