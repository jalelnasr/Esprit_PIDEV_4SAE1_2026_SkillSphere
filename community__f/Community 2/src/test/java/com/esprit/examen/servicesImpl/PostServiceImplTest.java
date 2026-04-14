package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.Post;
import com.esprit.examen.repositories.PostRepository;
import com.esprit.examen.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PostServiceImpl postService;

    @Test
    void createPost_setsCreatorAndTimestampBeforePersisting() {
        Post post = new Post();
        post.setContent("Hello test");

        when(userService.userExists(5L)).thenReturn(true);
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post created = postService.createPost(post, 5L);

        assertEquals(5L, created.getUserId());
        assertNotNull(created.getCreatedAt());
    }

    @Test
    void createPost_throwsWhenUserDoesNotExist() {
        Post post = new Post();
        post.setContent("Hello test");

        when(userService.userExists(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> postService.createPost(post, 99L));
        assertEquals("User not found with ID: 99", ex.getMessage());
    }

    @Test
    void getPostById_returnsEntityOrNull() {
        Post existing = new Post();
        existing.setPostId(3L);

        when(postRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(postRepository.findById(4L)).thenReturn(Optional.empty());

        assertEquals(3L, postService.getPostById(3L).getPostId());
        assertNull(postService.getPostById(4L));
    }

    @Test
    void listMethods_delegateToRepository() {
        when(postRepository.findAll()).thenReturn(List.of(new Post(), new Post()));
        when(postRepository.findByUserId(2L)).thenReturn(List.of(new Post()));
        when(postRepository.findByGroupId(8L)).thenReturn(List.of(new Post(), new Post(), new Post()));

        assertEquals(2, postService.getAllPosts().size());
        assertEquals(1, postService.getPostsByUser(2L).size());
        assertEquals(3, postService.getPostsByGroup(8L).size());
    }

    @Test
    void updatePost_updatesWhenEntityExists() {
        Post existing = new Post();
        existing.setPostId(9L);
        existing.setContent("old");

        Post payload = new Post();
        payload.setContent("new");
        payload.setImageUrl("img");
        payload.setVideoUrl("vid");
        payload.setGroupId(10L);

        when(postRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post updated = postService.updatePost(9L, payload);

        assertNotNull(updated);
        assertEquals("new", updated.getContent());
        assertEquals("img", updated.getImageUrl());
        assertEquals("vid", updated.getVideoUrl());
        assertEquals(10L, updated.getGroupId());
    }

    @Test
    void updatePost_returnsNullWhenEntityMissing() {
        when(postRepository.findById(101L)).thenReturn(Optional.empty());

        assertNull(postService.updatePost(101L, new Post()));
    }

    @Test
    void deletePost_delegates() {
        postService.deletePost(5L);

        verify(postRepository).deleteById(5L);
    }
}
