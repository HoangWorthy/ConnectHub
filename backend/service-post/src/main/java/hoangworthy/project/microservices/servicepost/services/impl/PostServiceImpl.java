package hoangworthy.project.microservices.servicepost.services.impl;

import hoangworthy.project.microservices.servicepost.dtos.PostDto;
import hoangworthy.project.microservices.servicepost.dtos.PostDtoResponse;
import hoangworthy.project.microservices.servicepost.entities.*;
import hoangworthy.project.microservices.servicepost.repositories.*;
import hoangworthy.project.microservices.servicepost.services.interfaces.PostService;
import hoangworthy.project.microservices.servicepost.services.interfaces.S3Service;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import jakarta.transaction.Transactional;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.embedded.netty.NettyWebServer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.profiles.Profile;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private ProfilePostRepository profilePostRepository;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private MediaRepository mediaRepository;

    public PostDtoResponse createPost(PostDto postDto, UUID accountId) {
        Post post = modelMapper.map(postDto, Post.class);
        ProfilePost profilePost = profilePostRepository.findById(accountId)
                        .orElseThrow(() -> new ResourceNotFoundException("Profile Not Found"));
        post.setProfile(profilePost);
        post = postRepository.save(post);
        if( post.getProfile() != null) {
            post.getProfile().setProfilePic(s3Service.presignDownloadUrl(post.getProfile().getProfilePic(), Duration.ofMinutes(15)));
        }
        return modelMapper.map(post, PostDtoResponse.class);
    }

    public List<PostDtoResponse> getPostByPages(int pageNo, int size, String sortBy, boolean ascending) {
        Pageable pageable = PageRequest.of(pageNo, size, ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
        List<PostDtoResponse> postPage = new ArrayList<>();
        postRepository.findAll(pageable).forEach(post -> {
            PostDtoResponse postDto = modelMapper.map(post, PostDtoResponse.class);
            postDto.getMedias().forEach((media) -> {
                media.setUrl(s3Service.presignDownloadUrl(media.getKey(), Duration.ofMinutes(15)));
            });
            postPage.add(postDto);
        });
        postPage.forEach(post -> {
            if (post.getProfile().getProfilePic() != null) {
                post.getProfile().setProfilePic(s3Service.presignDownloadUrl(post.getProfile().getProfilePic(), Duration.ofMinutes(15)));
            }
            post.getComments().forEach(comment -> {
                if (comment.getProfile().getProfilePic() != null) {
                    comment.getProfile().setProfilePic(s3Service.presignDownloadUrl(comment.getProfile().getProfilePic(), Duration.ofMinutes(15)));
                }
            });
        });
        return postPage;
    }

    public void likePost(String postId, UUID accountId) {
        Post post = postRepository.findById(UUID.fromString(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post Not Found"));
        LikeNumber likeNumber = new LikeNumber();
        likeNumber.setPost(post);
        likeNumber.setAccountId(accountId);
        likeRepository.save(likeNumber);
    }

    @Transactional
    public void dislikePost(String postId, UUID accountId) {
        Post post = postRepository.findById(UUID.fromString(postId))
                .orElseThrow(() -> new ResourceNotFoundException(postId+" not found"));
        LikeNumber likeNumber = likeRepository.findByPostAndAccountId(post, accountId);
        likeRepository.delete(likeNumber);
    }

    public void commentPost(String postId, UUID accountId, String content) {
        Post post = postRepository.findById(UUID.fromString(postId))
                .orElseThrow(() -> new ResourceNotFoundException(postId+" not found"));
        ProfilePost profilePost = profilePostRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile Not Found"));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setProfile(profilePost);
        comment.setContent(content);
        commentRepository.save(comment);
    }

    public List<PostDtoResponse> getMyPostByPages(UUID profileId, int pageNo,
                                                  int size, String sortBy,
                                                  boolean ascending) {
        Pageable pageable = PageRequest.of(pageNo, size, ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
        List<PostDtoResponse> postPage = new ArrayList<>();
        ProfilePost profilePost = profilePostRepository.findById(profileId)
                        .orElseThrow(() -> new ResourceNotFoundException("Profile Not Found"));
        Page<Post> posts = postRepository.findAllByProfile(profilePost, pageable);

        posts.forEach(post -> {
            PostDtoResponse postDto = modelMapper.map(post, PostDtoResponse.class);
            postDto.getMedias().forEach(media ->
                    media.setUrl(s3Service.presignDownloadUrl(media.getKey(), Duration.ofMinutes(15)))
            );
            postPage.add(postDto);
        });
        postPage.forEach(post -> {
            if (post.getProfile().getProfilePic() != null) {
                post.getProfile().setProfilePic(s3Service.presignDownloadUrl(post.getProfile().getProfilePic(), Duration.ofMinutes(15)));
            }
            post.getComments().forEach(comment -> {
                if (comment.getProfile().getProfilePic() != null) {
                    comment.getProfile().setProfilePic(s3Service.presignDownloadUrl(comment.getProfile().getProfilePic(), Duration.ofMinutes(15)));
                }
            });
        });
        return postPage;
    }

    public List<String> getMyMedia(UUID profileId, int pageNo,
                                   int size, String sortBy,
                                   boolean ascending) {
        List<PostDtoResponse> posts = getMyPostByPages(profileId, pageNo, size, sortBy, ascending);
        List<String> urls = new ArrayList<>();
        posts.forEach(post -> {
            post.getMedias().forEach(media -> {
                urls.add(s3Service.presignDownloadUrl(media.getKey(), Duration.ofMinutes(15 * 60)));
            });
        });
        return urls;
    }
}
