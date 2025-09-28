package hoangworthy.project.microservices.serviceprofile.services.impl;

import hoangworthy.project.microservices.serviceprofile.entities.Profile;
import hoangworthy.project.microservices.serviceprofile.events.UserRegisteredEvent;
import hoangworthy.project.microservices.serviceprofile.repositories.ProfileRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class AuthEventConsumer {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProfileRepository profileRepository;

    @KafkaListener(topics = {"auth.user.event"})
    public void onUserRegistered(UserRegisteredEvent userRegisteredEvent) {
        Profile profile = modelMapper.map(userRegisteredEvent, Profile.class);
        profileRepository.save(profile);
    }
}
