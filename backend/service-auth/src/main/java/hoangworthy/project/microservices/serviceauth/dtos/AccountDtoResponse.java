package hoangworthy.project.microservices.serviceauth.dtos;

import hoangworthy.project.microservices.serviceauth.enums.Role;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountDtoResponse {

    private UUID id;

    private String email;

    private Role role;
}
