package hoangworthy.project.microservices.servicepost.repositories;

import hoangworthy.project.microservices.servicepost.entities.Post;
import hoangworthy.project.microservices.servicepost.entities.ProfilePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findAllByProfile(ProfilePost profile, Pageable pageable);
    List<Post> findAllByProfile(ProfilePost profile);
}
