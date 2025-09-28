package hoangworthy.project.microservices.serviceprofile.controllers;

import hoangworthy.project.microservices.serviceprofile.dtos.PresignRequest;
import hoangworthy.project.microservices.serviceprofile.dtos.PresignResponse;
import hoangworthy.project.microservices.serviceprofile.dtos.ProfileDtoResponse;
import hoangworthy.project.microservices.serviceprofile.dtos.ProfileResponse;
import hoangworthy.project.microservices.serviceprofile.services.interfaces.ProfileService;
import hoangworthy.project.microservices.serviceprofile.services.interfaces.S3Service;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private S3Service s3Service;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(name = "AccountId") String accountId) {
        ProfileResponse profileResponse = profileService.getCurrentProfile(UUID.fromString(accountId));
        return ResponseEntity.ok()
                .body(profileResponse);
    }

    @GetMapping("/get-profiles")
    public ResponseEntity<?> getProfiles(@RequestParam(defaultValue = "0") int pageNo,
                                         @RequestParam(defaultValue = "3") int size,
                                         @RequestParam(defaultValue = "createdAt") String sortBy,
                                         @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(profileService.getProfiles(pageNo, size, sortBy, ascending));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProfile(@RequestParam String name) {
        return ResponseEntity.ok().body(profileService.searchProfiles(name));
    }

    @PostMapping("/{followerId}/follow")
    public ResponseEntity<?> followProfile(@AuthenticationPrincipal JwtUserDetails jwtUserDetails,
                                           @PathVariable(name = "followerId") String followerId) {
        profileService.followProfile(jwtUserDetails.getAccountId(),UUID.fromString(followerId));
        return ResponseEntity.ok()
                .build();
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal JwtUserDetails jwtUserDetails,
                                           @RequestBody ProfileDtoResponse profileDtoResponse) {
        if (!jwtUserDetails.getAccountId().equals(profileDtoResponse.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok()
                .body(profileService.updateProfile(profileDtoResponse));
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<?> getProfileInfo(@PathVariable("profileId") UUID profileId) {
        return ResponseEntity.ok().body(profileService.getProfileInfo(profileId));
    }

    @PostMapping("/avatar/s3/upload")
    public ResponseEntity<?> presign(@RequestBody PresignRequest request,
                                     @AuthenticationPrincipal JwtUserDetails userDetails) {
        String ext = Optional.ofNullable(request.getFileName())
                    .filter(f -> f.contains("."))
                    .map(f -> f.substring(f.lastIndexOf('.'))).orElse("");
        String key = String.format("users/%s/avatar/%s%s", userDetails.getAccountId(), UUID.randomUUID(), ext);
        String url = s3Service.presignUploadUrl(key,
                    request.getContentType(),
                    Duration.ofMinutes(15),
                    request.getPostId());
        return ResponseEntity.ok().body(new PresignResponse(url, key, 15*60));
    }
}
