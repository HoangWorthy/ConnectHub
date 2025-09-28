package hoangworthy.project.microservices.servicepost.services.impl;

import hoangworthy.project.microservices.servicepost.events.UserRegisteredEvent;
import hoangworthy.project.microservices.servicepost.entities.ProfilePost;
import hoangworthy.project.microservices.servicepost.repositories.ProfilePostRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class AuthEventConsumer {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProfilePostRepository profileRepository;

    @KafkaListener(topics = {"auth.user.event"})
    public void onUserRegistered(UserRegisteredEvent userRegisteredEvent) {
        ProfilePost profile = modelMapper.map(userRegisteredEvent, ProfilePost.class);
        profileRepository.save(profile);
    }
}
