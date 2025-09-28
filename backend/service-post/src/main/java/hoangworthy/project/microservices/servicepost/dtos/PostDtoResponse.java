package hoangworthy.project.microservices.servicepost.dtos;

import hoangworthy.project.microservices.servicepost.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostDtoResponse {
    private UUID id;
    private ProfilePostDto profile;
    private String content;
    private Visibility visibility;
    private LocalDateTime createdAt;
    private List<MediaDtoResponse> medias;
    private List<LikeDtoResponse> likes;
    private List<CommentDtoResponse> comments;
}
