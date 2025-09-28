package hoangworthy.project.microservices.servicepost.dtos;

import hoangworthy.project.microservices.servicepost.enums.MediaUploadingStatus;
import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaDtoResponse {

    private UUID id;
    private String key;
    private String url;
    private String type;
    private MediaUploadingStatus status;

}
