package hoangworthy.project.microservices.serviceprofile.services.interfaces;


import hoangworthy.project.microservices.serviceprofile.dtos.ProfileDtoResponse;
import hoangworthy.project.microservices.serviceprofile.dtos.ProfileResponse;

import java.util.List;
import java.util.UUID;

public interface ProfileService {

    public ProfileResponse getCurrentProfile(UUID accountId);

    public List<ProfileDtoResponse> getProfiles(int pageNo, int size, String sortBy, boolean ascending);

    public List<ProfileDtoResponse> searchProfiles(String name);

    public void followProfile(UUID profileId, UUID followerId);

    public ProfileResponse getProfileInfo(UUID accountId);

    public ProfileResponse updateProfile(ProfileDtoResponse profileDtoResponse);
}
