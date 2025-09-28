package hoangworthy.project.microservices.servicepost.repositories;

import hoangworthy.project.microservices.servicepost.entities.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    Media findByKey(String key);
}
