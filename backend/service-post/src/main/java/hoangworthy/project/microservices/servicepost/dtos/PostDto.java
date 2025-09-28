package hoangworthy.project.microservices.servicepost.dtos;

import hoangworthy.project.microservices.servicepost.enums.Visibility;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostDto {
    private String content;
    private Visibility visibility;
}
