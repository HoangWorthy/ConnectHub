package hoangworthy.project.microservices.servicepost.services.interfaces;

import hoangworthy.project.microservices.servicepost.dtos.PostDto;
import hoangworthy.project.microservices.servicepost.dtos.PostDtoResponse;

import java.util.List;
import java.util.UUID;

public interface PostService {

    public void dislikePost(String postId, UUID accountId);

    public void likePost(String postId, UUID accountId);

    public PostDtoResponse createPost(PostDto postDto, UUID accountId);

    public List<PostDtoResponse> getPostByPages(int pageNo, int size, String sortBy, boolean ascending);

    public void commentPost(String postId, UUID accountId, String content);

    public List<PostDtoResponse> getMyPostByPages(UUID profileId, int pageNo,
                                                  int size, String sortBy,
                                                  boolean ascending);

    public List<String> getMyMedia(UUID profileId, int pageNo,
                                   int size, String sortBy,
                                   boolean ascending);
}
