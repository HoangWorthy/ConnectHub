package hoangworthy.project.microservices.servicepost.controllers;

import hoangworthy.project.microservices.servicepost.dtos.MediaDtoResponse;
import hoangworthy.project.microservices.servicepost.dtos.PresignRequest;
import hoangworthy.project.microservices.servicepost.dtos.PresignResponse;
import hoangworthy.project.microservices.servicepost.services.interfaces.PostService;
import hoangworthy.project.microservices.servicepost.services.interfaces.S3Service;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/post/media")
public class MediaController {
    @Autowired
    private S3Service s3Service;
    @Autowired
    private PostService postService;

    @PostMapping("/s3/upload")
    public ResponseEntity<?> presign(@RequestBody List<PresignRequest> requests,
                                     @AuthenticationPrincipal JwtUserDetails userDetails) {
        Map<PresignRequest,String> keys = new HashMap<>();
        requests.forEach(request -> {
            String ext = Optional.ofNullable(request.getFileName())
                    .filter(f -> f.contains("."))
                    .map(f -> f.substring(f.lastIndexOf('.'))).orElse("");
            String key = String.format("users/%s/uploads/%s%s", userDetails.getAccountId(), UUID.randomUUID(), ext);
            keys.put(request,key);
        });
        List<PresignResponse> presigns = new ArrayList<>();
        keys.forEach((request,key) -> {
            String url = s3Service.presignUploadUrl(key,
                    request.getContentType(),
                    Duration.ofMinutes(15),
                    request.getPostId());
            presigns.add(new PresignResponse(url, key, 15*60));
        });

        return ResponseEntity.ok().body(presigns);
    }

    @GetMapping("/s3/download")
    public ResponseEntity<?> get(@RequestBody List<MediaDtoResponse> mediaDtoResponses) {
        List<PresignResponse>  presigns = new ArrayList<>();
        mediaDtoResponses.forEach((mediaDtoResponse) -> {
            String url = s3Service.presignDownloadUrl(mediaDtoResponse.getKey(), Duration.ofMinutes(15));
            presigns.add(new PresignResponse(url, mediaDtoResponse.getKey(), 15*60));
        });
        return ResponseEntity.ok().body(presigns);
    }

    @PostMapping("/s3/confirm")
    public ResponseEntity<?> confirm(@RequestParam("key") String key) {
        if (!s3Service.exists(key)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Upload not found");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getMyMedia(@AuthenticationPrincipal JwtUserDetails userDetails,
                                        @RequestParam(defaultValue = "0") int pageNo,
                                        @RequestParam(defaultValue = "3") int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                        @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(postService.getMyMedia(userDetails.getAccountId(), pageNo, size, sortBy, ascending));
    }
    @GetMapping("/user/{profileId}")
    public ResponseEntity<?> getOtherMedia(@PathVariable UUID profileId,
                                        @RequestParam(defaultValue = "0") int pageNo,
                                        @RequestParam(defaultValue = "3") int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                        @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(postService.getMyMedia(profileId, pageNo, size, sortBy, ascending));
    }
}
