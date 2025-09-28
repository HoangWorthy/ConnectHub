package hoangworthy.project.microservices.serviceprofile.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileResponse {
    private UUID id;
    private String nickName;
    private String fullName;
    private String bio;
    private String profilePic;
    private String address;
    private String phoneNumber;
    private int followings;
    private LocalDateTime createdAt;
    private List<FriendDto> friends;
}