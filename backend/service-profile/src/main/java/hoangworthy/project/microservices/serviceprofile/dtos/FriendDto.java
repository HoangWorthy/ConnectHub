package hoangworthy.project.microservices.serviceprofile.dtos;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FriendDto {
    private UUID id;
    private String fullName;
    private String nickName;
    private String profilePic;
}
