package hoangworthy.project.microservices.serviceprofile.events;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class UserRegisteredEvent {
    private UUID id;
    private String fullName;
}
