package hoangworthy.project.microservices.serviceprofile.services.impl;

import hoangworthy.project.microservices.serviceprofile.dtos.FriendDto;
import hoangworthy.project.microservices.serviceprofile.dtos.ProfileDtoResponse;
import hoangworthy.project.microservices.serviceprofile.dtos.ProfileResponse;
import hoangworthy.project.microservices.serviceprofile.entities.Profile;
import hoangworthy.project.microservices.serviceprofile.entities.Relationship;
import hoangworthy.project.microservices.serviceprofile.enums.RelationshipStatus;
import hoangworthy.project.microservices.serviceprofile.enums.RelationshipType;
import hoangworthy.project.microservices.serviceprofile.events.ProfileUpdateEvent;
import hoangworthy.project.microservices.serviceprofile.events.UserRegisteredEvent;
import hoangworthy.project.microservices.serviceprofile.repositories.ProfileRepository;
import hoangworthy.project.microservices.serviceprofile.repositories.RelationshipRepository;
import hoangworthy.project.microservices.serviceprofile.services.interfaces.ProfileService;
import hoangworthy.project.microservices.serviceprofile.services.interfaces.S3Service;
import jakarta.transaction.Transactional;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private RelationshipRepository relationshipRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProfileEventProducer eventProducer;
    @Autowired
    private S3Service s3Service;

    public ProfileResponse getCurrentProfile(UUID accountId) {
        Profile profile = profileRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        ProfileResponse profileResponse =  modelMapper.map(profile, ProfileResponse.class);
        profileResponse.setFriends(new ArrayList<>());
        profileResponse.setFollowings(relationshipRepository.countByProfileAndRelationshipTypeIn(profile, List.of(RelationshipType.FOLLOWING,RelationshipType.FRIEND)));
        List<Relationship> relationship = relationshipRepository
                .findAllByProfileAndRelationshipTypeEquals(profile, RelationshipType.FRIEND);
        relationship.forEach(relationship1 -> {
            FriendDto friendDto = modelMapper.map(relationship1.getTargetProfile(), FriendDto.class);
            if (friendDto.getProfilePic() != null) {
                friendDto.setProfilePic(s3Service.presignDownloadUrl(friendDto.getProfilePic(), Duration.ofMinutes(15)));
            }
            profileResponse.getFriends().add(friendDto);
        });
        if (profileResponse.getProfilePic() != null) {
            profileResponse.setProfilePic(s3Service.presignDownloadUrl(profileResponse.getProfilePic(), Duration.ofMinutes(15)));
        }
        return profileResponse;
    }

    public List<ProfileDtoResponse> getProfiles(int pageNo, int size,
                                                String sortBy, boolean ascending) {
        Pageable pageable = PageRequest.of(pageNo, size, ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
        Page<Profile> page = profileRepository.findAll(pageable);
        List<ProfileDtoResponse> profileDtoResponses = page.map(profile -> modelMapper.map(profile, ProfileDtoResponse.class))
                .stream().toList();
        profileDtoResponses.forEach(profileDtoResponse -> {
            if (profileDtoResponse.getProfilePic() != null) {
                profileDtoResponse.setProfilePic(s3Service.presignDownloadUrl(profileDtoResponse.getProfilePic(), Duration.ofMinutes(15)));
            }
        });
        return profileDtoResponses;
    }

    public List<ProfileDtoResponse> searchProfiles(String name) {
        List<Profile> profile = profileRepository.findAllByFullNameContainingIgnoreCaseOrNickNameContainingIgnoreCase(name,name);
        List<ProfileDtoResponse> profileDtoResponses = profile.stream().map(profile1 -> modelMapper.map(profile1, ProfileDtoResponse.class)).collect(Collectors.toList());
        profileDtoResponses.stream().forEach(profileDtoResponse -> {
            if (profileDtoResponse.getProfilePic() != null) {
                profileDtoResponse.setProfilePic(s3Service.presignDownloadUrl(profileDtoResponse.getProfilePic(), Duration.ofMinutes(15)));
            }
        });
        return profileDtoResponses;
    }

    @Transactional
    public void followProfile(UUID profileId, UUID followerId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        Profile follower = profileRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        Relationship relationship = relationshipRepository.findByProfileAndTargetProfile(follower,profile);
        if(relationship == null) {
            relationshipRepository.save(Relationship.builder()
                    .profile(profile)
                    .targetProfile(follower)
                    .relationshipStatus(RelationshipStatus.PENDING)
                    .relationshipType(RelationshipType.FOLLOWING)
                    .build());
        } else {
            relationshipRepository.save(Relationship.builder()
                    .profile(profile)
                    .targetProfile(follower)
                    .relationshipStatus(RelationshipStatus.ACCEPTED)
                    .relationshipType(RelationshipType.FRIEND)
                    .build());
            relationship.setRelationshipStatus(RelationshipStatus.ACCEPTED);
            relationship.setRelationshipType(RelationshipType.FRIEND);
            relationshipRepository.save(relationship);
        }
    }

    public ProfileResponse getProfileInfo(UUID accountId) {
        Profile profile = profileRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        ProfileResponse profileResponse =  modelMapper.map(profile, ProfileResponse.class);
        profileResponse.setFriends(new ArrayList<>());
        profileResponse.setFollowings(relationshipRepository.countByProfileAndRelationshipTypeIn(profile, List.of(RelationshipType.FOLLOWING,RelationshipType.FRIEND)));
        List<Relationship> relationship = relationshipRepository
                .findAllByProfileAndRelationshipTypeEquals(profile, RelationshipType.FRIEND);
        relationship.forEach(relationship1 -> {
            profileResponse.getFriends().add(modelMapper.map(relationship1.getTargetProfile(), FriendDto.class));
        });
        if (profileResponse.getProfilePic() != null) {
            profileResponse.setProfilePic(s3Service.presignDownloadUrl(profileResponse.getProfilePic(), Duration.ofMinutes(15)));
        }
        return profileResponse;
    }

    public ProfileResponse updateProfile(ProfileDtoResponse profileDtoResponse) {
        Profile profile = profileRepository.findById(profileDtoResponse.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        Profile updatedProfile = modelMapper.map(profileDtoResponse, Profile.class);
        profile.setProfilePic(updatedProfile.getProfilePic());
        profile.setNickName(updatedProfile.getNickName());
        profile.setAddress(updatedProfile.getAddress());
        profile.setBio(updatedProfile.getBio());
        profile.setFullName(updatedProfile.getFullName());
        profile.setPhoneNumber(updatedProfile.getPhoneNumber());
        ProfileUpdateEvent profileUpdateEvent = ProfileUpdateEvent.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .profilePic(profile.getProfilePic())
                .nickName(profile.getNickName())
                .build();
        eventProducer.publishProfileUpdateEvent(profileUpdateEvent);
        return modelMapper.map(profileRepository.save(updatedProfile), ProfileResponse.class);
    }
}
