package hoangworthy.project.microservices.serviceprofile.repositories;

import hoangworthy.project.microservices.serviceprofile.entities.Profile;
import hoangworthy.project.microservices.serviceprofile.entities.Relationship;
import hoangworthy.project.microservices.serviceprofile.enums.RelationshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {

    Relationship findByProfileAndTargetProfile(Profile profile, Profile targetProfile);

    List<Relationship> findAllByProfileAndRelationshipTypeEquals(Profile profile, RelationshipType relationshipType);

    int countByProfileAndRelationshipType(Profile profile, RelationshipType relationshipType);

    int countByProfileAndRelationshipTypeIn(Profile profile, Collection<RelationshipType> relationshipTypes);
}
