package hoangworthy.project.microservices.servicepost.dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfilePostDto {
    private String fullName;
    private String nickName;
    private String profilePic;
}
