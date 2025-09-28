package hoangworthy.project.microservices.servicepost.repositories;

import hoangworthy.project.microservices.servicepost.entities.LikeNumber;
import hoangworthy.project.microservices.servicepost.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<LikeNumber, UUID> {
    LikeNumber findByPostAndAccountId(Post post, UUID accountId);
}
