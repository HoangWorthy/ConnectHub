package hoangworthy.project.microservices.servicepost.events;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProfileUpdateEvent {
    private UUID id;
    private String nickName;
    private String fullName;
    private String profilePic;
}
