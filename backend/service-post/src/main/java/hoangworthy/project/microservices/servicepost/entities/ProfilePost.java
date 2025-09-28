package hoangworthy.project.microservices.servicepost.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class ProfilePost {

    @Id
    private UUID id;

    private String fullName;

    private String nickName;

    private String profilePic;
}
