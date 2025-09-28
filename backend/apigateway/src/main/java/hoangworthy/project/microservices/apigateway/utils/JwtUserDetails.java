package hoangworthy.project.microservices.apigateway.utils;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtUserDetails {
    private UUID accountId;
    private String role;
}