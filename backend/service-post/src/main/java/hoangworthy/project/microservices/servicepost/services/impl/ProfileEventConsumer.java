package hoangworthy.project.microservices.servicepost.services.impl;

import hoangworthy.project.microservices.servicepost.entities.ProfilePost;
import hoangworthy.project.microservices.servicepost.events.ProfileUpdateEvent;
import hoangworthy.project.microservices.servicepost.repositories.ProfilePostRepository;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileEventConsumer {

    @Autowired
    private ProfilePostRepository profilePostRepository;

    @KafkaListener(topics = "profile.user.event")
    public void updateProfile(ProfileUpdateEvent profileUpdateEvent) {
        ProfilePost profilePost = profilePostRepository.findById(profileUpdateEvent.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile post not found"));
        profilePost.setFullName(profileUpdateEvent.getFullName());
        profilePost.setProfilePic(profileUpdateEvent.getProfilePic());
        profilePost.setNickName(profileUpdateEvent.getNickName());
        profilePostRepository.save(profilePost);
    }
}
