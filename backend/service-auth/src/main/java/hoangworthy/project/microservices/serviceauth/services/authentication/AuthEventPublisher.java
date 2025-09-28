package hoangworthy.project.microservices.serviceauth.services.authentication;

import hoangworthy.project.microservices.serviceauth.events.UserRegisteredEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthEventPublisher {

    @Autowired
    private KafkaTemplate<String, UserRegisteredEvent> kafkaTemplate;

    public void publishUserRegister(UUID accountId, String fullName) {
        UserRegisteredEvent userRegisteredEvent = new UserRegisteredEvent(accountId, fullName);
        Message<UserRegisteredEvent> message = MessageBuilder.withPayload(userRegisteredEvent)
                        .setHeader(KafkaHeaders.TOPIC, "auth.user.event")
                                .setHeader(KafkaHeaders.KEY, userRegisteredEvent.getId().toString())
                                        .build();
        kafkaTemplate.send(message);
    }
}
