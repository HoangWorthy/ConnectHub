package hoangworthy.project.microservices.servicepost.services.impl;

import hoangworthy.project.microservices.servicepost.entities.Media;
import hoangworthy.project.microservices.servicepost.entities.Post;
import hoangworthy.project.microservices.servicepost.enums.MediaUploadingStatus;
import hoangworthy.project.microservices.servicepost.repositories.MediaRepository;
import hoangworthy.project.microservices.servicepost.repositories.PostRepository;
import hoangworthy.project.microservices.servicepost.services.interfaces.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3ServiceImpl implements S3Service {

    public final S3Client s3client;
    public final String bucketName;
    public final S3Presigner s3Presigner;
    @Autowired
    public MediaRepository mediaRepository;
    @Autowired
    public PostRepository postRepository;

    public S3ServiceImpl(S3Client s3client,
                         S3Presigner s3Presigner,
                         @Value("${AWS_S3_BUCKET}") String bucketName) {
        this.s3client = s3client;
        this.bucketName = bucketName;
        this.s3Presigner = s3Presigner;
    }

    public String presignUploadUrl(String key, String contentType, Duration expiration, UUID postId) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .key(key)
                .bucket(bucketName)
                .contentType(contentType)
                .build();
        PutObjectPresignRequest putObjectPresignRequest = PutObjectPresignRequest.builder()
                .putObjectRequest(putObjectRequest)
                .signatureDuration(expiration)
                .build();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("post not found with id: " + postId));
        Media media = new Media();
        media.setKey(key);
        media.setType(contentType);
        media.setStatus(MediaUploadingStatus.PENDING);
        media.setPost(post);
        mediaRepository.save(media);
        return s3Presigner.presignPutObject(putObjectPresignRequest).url().toString();
    }

    public String presignDownloadUrl(String key, Duration expiration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                .getObjectRequest(getObjectRequest)
                .signatureDuration(expiration)
                .build();
        return s3Presigner.presignGetObject(getObjectPresignRequest).url().toString();
    }

    public boolean exists(String key) {
        try {
            s3client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(key).build());
            Media media = mediaRepository.findByKey(key);
            media.setStatus(MediaUploadingStatus.AVAILABLE);
            mediaRepository.save(media);
            return true;
        } catch (S3Exception e) {
            return false;
        }

    }
}
