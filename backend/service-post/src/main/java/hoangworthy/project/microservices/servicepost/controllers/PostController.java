package hoangworthy.project.microservices.servicepost.controllers;

import hoangworthy.project.microservices.servicepost.dtos.PostDto;
import hoangworthy.project.microservices.servicepost.services.interfaces.PostService;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/post")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestBody PostDto postDto,
                                        @AuthenticationPrincipal JwtUserDetails userDetails) {
        return ResponseEntity.ok()
                .body(postService.createPost(postDto,userDetails.getAccountId()));
    }

    @GetMapping("/feeds")
    public ResponseEntity<?> getPosts(@RequestParam(defaultValue = "0") int pageNo,
                                      @RequestParam(defaultValue = "3") int size,
                                      @RequestParam(defaultValue = "id") String sortBy,
                                      @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(postService.getPostByPages(pageNo, size, sortBy, ascending));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId,
                                      @AuthenticationPrincipal JwtUserDetails userDetails) {
        postService.likePost(postId, userDetails.getAccountId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/dislike")
    public ResponseEntity<?> dislikePost(@PathVariable String postId,
                                      @AuthenticationPrincipal JwtUserDetails userDetails) {
        postService.dislikePost(postId, userDetails.getAccountId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> commentPost(@PathVariable String postId,
                                        @AuthenticationPrincipal JwtUserDetails userDetails,
                                        @RequestParam String content) {
        postService.commentPost(postId, userDetails.getAccountId(), content);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal JwtUserDetails userDetails,
                                            @RequestParam(defaultValue = "0") int pageNo,
                                            @RequestParam(defaultValue = "3") int size,
                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                            @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(postService.getMyPostByPages(userDetails.getAccountId(),
                        pageNo, size, sortBy, ascending));
    }
    @GetMapping("/user/{profileId}")
    public ResponseEntity<?> getOtherUserPost(@PathVariable UUID profileId,
                                            @RequestParam(defaultValue = "0") int pageNo,
                                            @RequestParam(defaultValue = "3") int size,
                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                            @RequestParam(defaultValue = "false") boolean ascending) {
        return ResponseEntity.ok()
                .body(postService.getMyPostByPages(profileId, pageNo, size, sortBy, ascending));
    }
}
