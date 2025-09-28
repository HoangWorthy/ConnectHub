package hoangworthy.project.microservices.servicepost.repositories;

import hoangworthy.project.microservices.servicepost.entities.ProfilePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProfilePostRepository extends JpaRepository<ProfilePost, UUID> {
}
