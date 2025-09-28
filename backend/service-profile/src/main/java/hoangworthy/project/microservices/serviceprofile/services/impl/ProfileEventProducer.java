package hoangworthy.project.microservices.serviceprofile.services.impl;

import hoangworthy.project.microservices.serviceprofile.events.ProfileUpdateEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
public class ProfileEventProducer {

    @Autowired
    private KafkaTemplate<String, ProfileUpdateEvent> kafkaTemplate;

    public void publishProfileUpdateEvent(ProfileUpdateEvent profileUpdateEvent) {
        Message<ProfileUpdateEvent> message = MessageBuilder
                .withPayload(profileUpdateEvent)
                        .setHeader(KafkaHeaders.TOPIC, "profile.user.event")
                                .setHeader(KafkaHeaders.KEY, profileUpdateEvent.getId().toString())
                                        .build();
        kafkaTemplate.send(message);
    }

}
