package hoangworthy.project.microservices.serviceprofile.repositories;

import hoangworthy.project.microservices.serviceprofile.entities.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    List<Profile> findAllByFullNameContainingIgnoreCaseOrNickNameContainingIgnoreCase(String fullName, String nickName);

}
