package hoangworthy.project.microservices.serviceprofile.services.impl;

import hoangworthy.project.microservices.serviceprofile.services.interfaces.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
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

}
