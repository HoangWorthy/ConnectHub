package hoangworthy.project.microservices.serviceprofile.dtos;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileDtoResponse {
    private UUID id;
    private String nickName;
    private String fullName;
    private String bio;
    private String profilePic;
    private String address;
    private String phoneNumber;
}
