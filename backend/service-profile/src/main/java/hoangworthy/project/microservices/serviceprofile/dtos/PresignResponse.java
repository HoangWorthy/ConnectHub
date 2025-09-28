package hoangworthy.project.microservices.serviceprofile.dtos;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresignResponse {
    private String url;
    private String key;
    private long expiresIn;
}
