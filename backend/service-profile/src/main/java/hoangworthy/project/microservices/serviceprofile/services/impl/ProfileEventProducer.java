package hoangworthy.project.microservices.serviceprofile.services.impl;

import hoangworthy.project.microservices.serviceprofile.events.ProfileUpdateEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProfileEventProducer {

    @Autowired
    private KafkaTemplate<String, ProfileUpdateEvent> kafkaTemplate;

    public void publishProfileUpdateEvent(ProfileUpdateEvent profileUpdateEvent) {
        kafkaTemplate.send("profile.user.event", profileUpdateEvent.getId().toString(), profileUpdateEvent);
    }

}
