package hoangworthy.project.microservices.serviceprofile.services.interfaces;

import java.time.Duration;
import java.util.UUID;

public interface S3Service {
    public String presignUploadUrl(String key, String contentType, Duration expiration, UUID postId);
    public String presignDownloadUrl(String key, Duration expiration);
}
