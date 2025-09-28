package hoangworthy.project.microservices.serviceauth.services.authentication;

import hoangworthy.project.microservices.serviceauth.events.UserRegisteredEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthEventPublisher {

    @Autowired
    private KafkaTemplate<String, UserRegisteredEvent> kafkaTemplate;

    public void publishUserRegister(UUID accountId, String fullName) {
        UserRegisteredEvent userRegisteredEvent = new UserRegisteredEvent(accountId, fullName);
        kafkaTemplate.send("auth.user.event", accountId.toString(), userRegisteredEvent);
    }
}
