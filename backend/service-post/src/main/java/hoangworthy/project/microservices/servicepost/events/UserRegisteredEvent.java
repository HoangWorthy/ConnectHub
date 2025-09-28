package hoangworthy.project.microservices.servicepost.events;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserRegisteredEvent {
    private UUID id;
    private String fullName;
}
