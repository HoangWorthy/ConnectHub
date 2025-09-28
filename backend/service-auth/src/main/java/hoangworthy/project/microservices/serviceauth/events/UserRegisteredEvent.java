package hoangworthy.project.microservices.serviceauth.events;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Data
@NoArgsConstructor
public class UserRegisteredEvent {
    private UUID id;
    private String fullName;
}
