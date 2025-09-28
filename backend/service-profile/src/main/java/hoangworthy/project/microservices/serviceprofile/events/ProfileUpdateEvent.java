package hoangworthy.project.microservices.serviceprofile.events;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileUpdateEvent {
    private UUID id;
    private String nickName;
    private String fullName;
    private String profilePic;
}
