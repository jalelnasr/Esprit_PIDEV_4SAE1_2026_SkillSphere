package com.esprit.examen.controllers;

import com.esprit.examen.config.JwtProxyAuthenticationFilter;
import com.esprit.examen.config.SecurityConfig;
import com.esprit.examen.entities.Post;
import com.esprit.examen.services.PostService;
import com.esprit.examen.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PostController.class)
@Import(SecurityConfig.class)
class PostControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtProxyAuthenticationFilter jwtProxyAuthenticationFilter;

    @BeforeEach
    void allowFilterChainExecution() throws Exception {
        doAnswer(invocation -> {
            ServletRequest request = invocation.getArgument(0);
            ServletResponse response = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtProxyAuthenticationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));
    }

    @Test
    @WithMockUser(roles = "APPRENANT")
    void createPost_usesAuthenticatedUserId() throws Exception {
        when(userService.getCurrentUserId()).thenReturn(5L);

        Post created = new Post();
        created.setPostId(10L);
        created.setContent("Hello integration");
        created.setUserId(5L);
        created.setCreatedAt(LocalDateTime.now());
        when(postService.createPost(any(Post.class), eq(5L))).thenReturn(created);

        mockMvc.perform(post("/api/posts")
                .contentType("application/json")
                .content("{\"content\":\"Hello integration\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.postId").value(10))
            .andExpect(jsonPath("$.userId").value(5));

        verify(userService).getCurrentUserId();
        verify(postService).createPost(any(Post.class), eq(5L));
    }
}
